import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LETTER_TEMPLATES } from '@/data/constants';
import { Copy, Printer, FileText, CheckCircle, Download, AlertTriangle, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { AuditRecord } from '@/lib/db';
import { jsPDF } from 'jspdf';
import { useLanguage } from '@/hooks/use-language';
export function LettersPage() {
  const location = useLocation();
  const { language } = useLanguage();
  const audit = location.state?.audit as AuditRecord | undefined;
  const templates = useMemo(() => {
    return (LETTER_TEMPLATES[language] && LETTER_TEMPLATES[language].length > 0)
      ? LETTER_TEMPLATES[language]
      : LETTER_TEMPLATES.en;
  }, [language]);
  const [selected, setSelected] = useState(templates[0] || LETTER_TEMPLATES.en[0]);
  const [form, setForm] = useState({
    name: '',
    city: 'Philadelphia',
    state: 'PA',
    provider: audit?.extractedData.providerName || '',
    accountNumber: audit?.extractedData.accountNumber || '',
    date: audit?.extractedData.dateOfService || '',
    billDate: audit?.extractedData.billDate || '',
    amount: audit?.totalAmount ? `${audit.totalAmount}` : ''
  });
  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    if (!form.name.trim()) errors.push("Patient Name is required.");
    if (!form.accountNumber.trim()) errors.push("Account Number is missing (Check your bill).");
    if (!form.provider.trim()) errors.push("Facility Name is required for Act 102 citation.");
    return errors;
  }, [form]);
  useEffect(() => {
    if (templates.length > 0) {
      setSelected(templates[0]);
    }
  }, [templates]);
  const letterBody = useMemo(() => {
    if (!selected) return "";
    let body = selected.body;
    const map: Record<string, string> = {
      '{SERVICE_DATE}': form.date || '[DATE OF SERVICE]',
      '{BILL_DATE}': form.billDate || '[BILL DATE]',
      '{ACCOUNT_NUMBER}': form.accountNumber || '[ACCOUNT #]',
      '{PROVIDER_NAME}': form.provider || '[FACILITY NAME]',
      '{PATIENT_NAME}': form.name || '[PATIENT NAME]',
      '{TOTAL_AMOUNT}': form.amount || '[TOTAL AMOUNT]'
    };
    Object.entries(map).forEach(([k, v]) => {
      body = body.split(k).join(v);
    });
    return body;
  }, [selected, form]);
  const handlePrint = () => {
    if (validationErrors.length > 0) {
      toast.error("Compliance Error", { description: "Complete all fields to ensure legal validity in PA." });
      return;
    }
    window.print();
  };
  const handleDownloadPDF = () => {
    if (validationErrors.length > 0) {
      toast.error("Compliance Error", { description: "Please provide a Patient Name and Account Number before exporting." });
      return;
    }
    const doc = new jsPDF();
    const splitText = doc.splitTextToSize(letterBody, 170);
    doc.setProperties({
      title: `Dispute Letter - ${form.accountNumber}`,
      subject: 'Act 102 Medical Bill Dispute',
      author: 'BillGuard PA Auditor',
      keywords: `Medical, PA, Act 102, Audit-${audit?.id || 'Manual'}`
    });
    doc.setFont("times", "normal");
    doc.setFontSize(10);
    doc.text(`Reference: ${form.accountNumber || 'PENDING'}`, 20, 20);
    doc.text(`${form.city}, ${form.state}`, 190, 20, { align: 'right' });
    doc.text(new Date().toLocaleDateString(undefined, { dateStyle: 'long' }), 190, 25, { align: 'right' });
    doc.setFontSize(12);
    doc.setFont("times", "bold");
    doc.text(form.name || "Patient Name", 20, 45);
    doc.setFont("times", "normal");
    doc.text(`Account: ${form.accountNumber}`, 20, 50);
    doc.setFont("times", "bold");
    doc.text("NOTICE OF FORMAL BILLING DISPUTE", 105, 70, { align: 'center' });
    doc.line(70, 72, 140, 72);
    doc.setFont("times", "normal");
    doc.text(splitText, 20, 90);
    const finalY = 90 + (splitText.length * 7) + 20;
    doc.text("Sincerely,", 20, finalY);
    doc.line(20, finalY + 15, 70, finalY + 15);
    doc.setFont("times", "bold");
    doc.text(form.name.toUpperCase() || "SIGNATURE", 20, finalY + 20);
    doc.setFont("times", "italic");
    doc.setFontSize(8);
    doc.text(`Dispatched via BillGuard PA Auditor Integrity Engine (Hash: ${audit?.fingerprint?.substring(0, 16) || 'MANUAL-SIG'})`, 20, finalY + 30);
    doc.save(`PA_Dispute_Letter_${form.accountNumber || 'Draft'}.pdf`);
    toast.success('Statutory-Compliant PDF Generated');
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      <div className="lg:col-span-5 space-y-8 no-print">
        <div className="space-y-2">
          <h1 className="text-4xl font-display font-bold">Dispute Generator</h1>
          <p className="text-muted-foreground">Select a statutory template to contest Pennsylvania billing errors.</p>
        </div>
        {validationErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 text-red-800">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <div className="text-xs space-y-1">
              <p className="font-bold">Missing Compliance Data:</p>
              <ul className="list-disc list-inside">
                {validationErrors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          </div>
        )}
        <div className="space-y-4">
          <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Available Templates</Label>
          <ScrollArea className="h-[250px] rounded-xl border p-2 bg-background">
            <div className="space-y-2">
              {templates.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelected(t)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all hover:bg-muted/50 ${selected.id === t.id ? 'border-primary bg-primary/5' : 'border-transparent'}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-bold text-sm">{t.name}</p>
                    {selected.id === t.id && <CheckCircle className="h-4 w-4 text-primary" />}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{t.description}</p>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
        <Card className="p-6 space-y-4 bg-muted/20 rounded-2xl border-none">
          <p className="text-xs font-bold uppercase text-muted-foreground mb-2 flex items-center gap-2">
            <ShieldCheck className="h-3 w-3" /> Statutory Metadata
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold">Full Name</Label>
              <Input className="h-9 text-sm rounded-lg" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold">Account #</Label>
              <Input className="h-9 text-sm rounded-lg" value={form.accountNumber} onChange={e => setForm(f => ({...f, accountNumber: e.target.value}))} />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold">Facility</Label>
              <Input className="h-9 text-sm rounded-lg" value={form.provider} onChange={e => setForm(f => ({...f, provider: e.target.value}))} />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold">Service Date</Label>
              <Input className="h-9 text-sm rounded-lg" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold">Amount ($)</Label>
              <Input className="h-9 text-sm rounded-lg" value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))} />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold">Bill Date</Label>
              <Input className="h-9 text-sm rounded-lg" value={form.billDate} onChange={e => setForm(f => ({...f, billDate: e.target.value}))} />
            </div>
          </div>
        </Card>
      </div>
      <div className="lg:col-span-7 space-y-6">
        <div className="flex justify-between items-center no-print bg-slate-900 text-white p-4 rounded-xl shadow-lg">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-400" />
            <span className="font-bold text-sm">Legal Correspondence Preview</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="h-8 rounded-lg text-white hover:bg-white/10" onClick={() => { navigator.clipboard.writeText(letterBody); toast.success('Copied'); }}>
              <Copy className="h-4 w-4 mr-2" /> Copy
            </Button>
            <Button variant="secondary" size="sm" className="h-8 rounded-lg font-bold" onClick={handleDownloadPDF} disabled={validationErrors.length > 0}>
              <Download className="h-4 w-4 mr-2" /> Export PDF
            </Button>
            <Button size="sm" className="h-8 rounded-lg bg-blue-600 hover:bg-blue-500 font-bold" onClick={handlePrint} disabled={validationErrors.length > 0}>
              <Printer className="h-4 w-4 mr-2" /> Print
            </Button>
          </div>
        </div>
        <Card className="p-16 font-serif text-black bg-white shadow-2xl min-h-[850px] border-none print:shadow-none print:p-0 rounded-none relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-slate-200 no-print" />
          <div className="max-w-[650px] mx-auto space-y-10">
            <div className="flex justify-between items-start border-b border-slate-100 pb-8">
              <div className="text-[10px] uppercase tracking-widest text-slate-400 leading-relaxed font-sans">
                Patient Dispute Registry <br />
                Token: {audit?.id?.substring(0, 12) || 'MANUAL'} <br />
                Audit Hash: {audit?.fingerprint?.substring(0, 12) || 'N/A'}
              </div>
              <div className="text-right text-xs font-sans">
                <p className="font-bold">{form.city}, {form.state}</p>
                <p>{new Date().toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="font-bold text-lg">{form.name || "[PATIENT NAME]"}</p>
              <p className="text-sm">Account: {form.accountNumber || "[ACCOUNT NUMBER]"}</p>
            </div>
            <div className="py-4">
              <p className="font-bold underline text-center uppercase tracking-wide">NOTICE OF FORMAL BILLING DISPUTE</p>
            </div>
            <div className="whitespace-pre-wrap leading-relaxed text-[15px] min-h-[350px]">
              {letterBody}
            </div>
            <div className="pt-16 space-y-8">
              <p>Sincerely,</p>
              <div className="space-y-1">
                <div className="h-px bg-black w-48 mb-2" />
                <p className="font-bold uppercase text-sm">{form.name || "Signature"}</p>
                <p className="text-[10px] text-slate-500 italic font-sans">Verification: Dispatched via BillGuard PA Compliance Portal</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}