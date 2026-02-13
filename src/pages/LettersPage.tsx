import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { LETTER_TEMPLATES, PA_DOH_HOTLINE } from '@/data/constants';
import { Download, FileText, Gavel, Printer } from 'lucide-react';
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
  const [includeCitations, setIncludeCitations] = useState(true);
  const [form, setForm] = useState({
    name: '',
    city: 'Philadelphia',
    state: 'PA',
    provider: audit?.extractedData?.providerName || '',
    accountNumber: audit?.extractedData?.accountNumber || '',
    date: audit?.extractedData?.dateOfService || '',
    billDate: audit?.extractedData?.billDate || '',
    amount: audit?.totalAmount ? `${audit.totalAmount}` : ''
  });
  useEffect(() => {
    if (templates.length > 0) setSelected(templates[0]);
  }, [templates]);
  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    if (!form.name.trim()) errors.push("Patient Name is required.");
    if (!form.accountNumber.trim()) errors.push("Account Number is missing.");
    if (!form.provider.trim()) errors.push("Facility Name is required.");
    return errors;
  }, [form]);
  const letterBody = useMemo(() => {
    if (!selected) return "";
    let body = selected.body;
    const map: Record<string, string> = {
      '{SERVICE_DATE}': form.date || '[DATE]',
      '{BILL_DATE}': form.billDate || '[BILL DATE]',
      '{ACCOUNT_NUMBER}': form.accountNumber || '[ACCOUNT #]',
      '{PROVIDER_NAME}': form.provider || '[FACILITY]',
      '{PATIENT_NAME}': form.name || '[PATIENT NAME]',
      '{TOTAL_AMOUNT}': form.amount || '[TOTAL]'
    };
    Object.entries(map).forEach(([k, v]) => { body = body.split(k).join(v); });
    if (includeCitations && audit?.reviewPoints && audit.reviewPoints.length > 0) {
      body += "\n\nSTATUTORY COMPLIANCE NOTES:";
      audit.reviewPoints.forEach(f => {
        body += `\n- Education Point: ${f.type.toUpperCase().replace(/-/g, ' ')} (Ref: ${f.taxonomy?.statute_ref || 'PA Act 102'})`;
      });
    }
    if (audit?.fapEligible) {
      body += "\n\nFINANCIAL ASSISTANCE REQUEST:\nI also request a screening for Financial Assistance Policy (FAP) eligibility pursuant to federal and state hospital transparency requirements. Please provide the appropriate application forms along with the requested itemized bill.";
    }
    return body;
  }, [selected, form, includeCitations, audit]);
  const handleDownloadPDF = () => {
    if (validationErrors.length > 0) {
      toast.error("Compliance Error", { description: "Complete all fields to ensure legal validity in PA." });
      return;
    }
    try {
      const doc = new jsPDF();
      const splitText = doc.splitTextToSize(letterBody, 170);
      doc.setFont("times", "normal");
      doc.setFontSize(10);
      doc.text(`Reference: ${form.accountNumber}`, 20, 20);
      doc.text(`${form.city}, ${form.state}`, 190, 20, { align: 'right' });
      doc.text(new Date().toLocaleDateString(), 190, 25, { align: 'right' });
      doc.setFontSize(12);
      doc.setFont("times", "bold");
      doc.text(form.name, 20, 45);
      doc.setFont("times", "normal");
      doc.text(`Account: ${form.accountNumber}`, 20, 50);
      doc.setFont("times", "bold");
      doc.text("NOTICE OF FORMAL BILLING DISPUTE & FAP REQUEST", 105, 70, { align: 'center' });
      doc.line(70, 72, 140, 72);
      doc.setFont("times", "normal");
      doc.text(splitText, 20, 90);
      const finalY = 90 + (splitText.length * 7) + 20;
      doc.text("Sincerely,", 20, Math.min(finalY, 260));
      doc.text(form.name.toUpperCase(), 20, Math.min(finalY + 15, 275));
      doc.setFontSize(8);
      doc.setFont("times", "italic");
      doc.text(`Secondary Remediation: PA DOH Consumer Hotline ${PA_DOH_HOTLINE}`, 20, 285);
      doc.text(`Signed via BillGuard PA Auditor Registry (Audit Hash: ${audit?.fingerprint?.substring(0, 12) || 'N/A'})`, 20, 290);
      doc.save(`PA_Dispute_Letter_${form.accountNumber}.pdf`);
      toast.success('Statutory PDF Generated');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF');
    }
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      <div className="lg:col-span-5 space-y-8 no-print">
        <div className="space-y-2">
          <h1 className="text-4xl font-display font-bold">Dispute Generator</h1>
          <p className="text-muted-foreground">Select a PA statutory template to contest billing errors.</p>
        </div>
        <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Gavel className="h-5 w-5 text-indigo-400" />
            <span className="font-bold">Statutory Options</span>
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs text-slate-300">Include Legal Citations</Label>
            <Switch checked={includeCitations} onCheckedChange={setIncludeCitations} />
          </div>
          {audit?.fapEligible && (
            <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
              <p className="text-[10px] font-bold uppercase text-indigo-300">FAP Active</p>
              <p className="text-xs">Financial Assistance section will be added automatically.</p>
            </div>
          )}
        </div>
        <div className="space-y-4">
          <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Templates</Label>
          <ScrollArea className="h-[200px] rounded-xl border p-2 bg-background">
            <div className="space-y-2">
              {templates.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelected(t)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selected.id === t.id ? 'border-primary bg-primary/5' : 'border-transparent'}`}
                >
                  <p className="font-bold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{t.description}</p>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
        <Card className="p-6 space-y-4 bg-muted/20 rounded-2xl border-none">
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
              <Label className="text-[10px] uppercase font-bold">Amount ($)</Label>
              <Input className="h-9 text-sm rounded-lg" value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))} />
            </div>
          </div>
        </Card>
      </div>
      <div className="lg:col-span-7 space-y-6">
        <div className="flex justify-between items-center no-print bg-slate-900 text-white p-4 rounded-xl shadow-lg">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-400" />
            <span className="font-bold text-sm">Dispute Preview</span>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" className="h-8 rounded-lg font-bold" onClick={handleDownloadPDF} disabled={validationErrors.length > 0}>
              <Download className="h-4 w-4 mr-2" /> Export PDF
            </Button>
            <Button size="sm" className="h-8 rounded-lg bg-blue-600 hover:bg-blue-500 font-bold" onClick={() => window.print()} disabled={validationErrors.length > 0}>
              <Printer className="h-4 w-4 mr-2" /> Print
            </Button>
          </div>
        </div>
        <Card className="p-16 font-serif text-black bg-white shadow-2xl min-h-[850px] border-none print:shadow-none print:p-0 rounded-none relative">
          <div className="max-w-[650px] mx-auto space-y-8">
            <div className="flex justify-between items-start border-b border-slate-100 pb-8 font-sans">
              <div className="text-[10px] uppercase tracking-widest text-slate-400">BillGuard PA Dispute Package</div>
              <div className="text-right text-xs">
                <p className="font-bold">{form.city}, {form.state}</p>
                <p>{new Date().toLocaleDateString()}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="font-bold text-lg">{form.name || "[NAME]"}</p>
              <p className="text-sm">Account: {form.accountNumber || "[ACCT]"}</p>
            </div>
            <p className="font-bold underline text-center uppercase tracking-wide py-4">NOTICE OF FORMAL DISPUTE</p>
            <div className="whitespace-pre-wrap leading-relaxed text-[15px] min-h-[400px]">
              {letterBody}
            </div>
            <div className="pt-10 border-t border-dashed">
              <p className="text-[10px] text-slate-500 font-sans italic">Remediation Path: PA Department of Health Consumer Hotline {PA_DOH_HOTLINE}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}