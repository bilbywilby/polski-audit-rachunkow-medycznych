import React, { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LETTER_TEMPLATES } from '@/data/constants';
import { Copy, Printer, FileText, CheckCircle, Download } from 'lucide-react';
import { toast } from 'sonner';
import { AuditRecord } from '@/lib/db';
import { jsPDF } from 'jspdf';
export function LettersPage() {
  const location = useLocation();
  const audit = location.state?.audit as AuditRecord | undefined;
  const templates = LETTER_TEMPLATES.en;
  const [selected, setSelected] = useState(templates[0]);
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
  const letterBody = useMemo(() => {
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
    window.print();
  };
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const splitText = doc.splitTextToSize(letterBody, 170);
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
    doc.text("Dispatched via BillGuard PA Secure Portal", 20, finalY + 25);
    doc.save(`Dispute_Letter_${form.accountNumber || 'Draft'}.pdf`);
    toast.success('PDF Generated successfully');
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      <div className="lg:col-span-5 space-y-8 no-print">
        <div className="space-y-2">
          <h1 className="text-4xl font-display font-bold">Dispute Generator</h1>
          <p className="text-muted-foreground">Select a professional template to fight billing errors.</p>
        </div>
        <div className="space-y-4">
          <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Available Templates</Label>
          <ScrollArea className="h-[300px] rounded-xl border p-2">
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
          <p className="text-xs font-bold uppercase text-muted-foreground mb-2">Letter Details</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold">Full Name</Label>
              <Input className="h-9 text-sm" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold">Account #</Label>
              <Input className="h-9 text-sm" value={form.accountNumber} onChange={e => setForm(f => ({...f, accountNumber: e.target.value}))} />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold">Facility</Label>
              <Input className="h-9 text-sm" value={form.provider} onChange={e => setForm(f => ({...f, provider: e.target.value}))} />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold">Service Date</Label>
              <Input className="h-9 text-sm" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold">Amount ($)</Label>
              <Input className="h-9 text-sm" value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))} />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold">Bill Date</Label>
              <Input className="h-9 text-sm" value={form.billDate} onChange={e => setForm(f => ({...f, billDate: e.target.value}))} />
            </div>
          </div>
        </Card>
      </div>
      <div className="lg:col-span-7 space-y-6">
        <div className="flex justify-between items-center no-print bg-muted/30 p-4 rounded-xl">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span className="font-bold">Correspondence Preview</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-lg" onClick={() => { navigator.clipboard.writeText(letterBody); toast.success('Copied to clipboard'); }}>
              <Copy className="h-4 w-4 mr-2" /> Copy
            </Button>
            <Button variant="outline" size="sm" className="rounded-lg" onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 mr-2" /> PDF
            </Button>
            <Button size="sm" className="rounded-lg" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" /> Print
            </Button>
          </div>
        </div>
        <Card className="p-16 font-serif text-black bg-white shadow-2xl min-h-[750px] border-none print:shadow-none print:p-0">
          <div className="max-w-[650px] mx-auto space-y-10">
            <div className="flex justify-between items-start border-b pb-6">
              <div className="text-xs uppercase tracking-tighter text-slate-400">
                Patient Dispute Correspondence <br />
                Reference: {form.accountNumber || 'PENDING'}
              </div>
              <div className="text-right text-xs">
                <p className="font-bold">{form.city}, {form.state}</p>
                <p>{new Date().toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="font-bold text-lg">{form.name || "Patient Name"}</p>
              <p className="text-sm">Account: {form.accountNumber}</p>
            </div>
            <div className="py-4">
              <p className="font-bold underline text-center uppercase tracking-wide">NOTICE OF FORMAL BILLING DISPUTE</p>
            </div>
            <div className="whitespace-pre-wrap leading-relaxed text-[15px] min-h-[300px]">
              {letterBody}
            </div>
            <div className="pt-16 space-y-8">
              <p>Sincerely,</p>
              <div className="space-y-1">
                <div className="h-px bg-black w-48 mb-2" />
                <p className="font-bold uppercase text-sm">{form.name || "Signature"}</p>
                <p className="text-xs text-slate-500 italic">Dispatched via BillGuard PA Secure Portal</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}