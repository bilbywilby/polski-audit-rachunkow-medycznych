import React, { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { LETTER_TEMPLATES } from '@/data/constants';
import { Copy, Printer, FileText, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { AuditRecord } from '@/lib/db';
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
    amount: audit?.totalAmount ? `$${audit.totalAmount}` : ''
  });
  const letterBody = useMemo(() => {
    let body = selected.body;
    const map: Record<string, string> = {
      '{SERVICE_DATE}': form.date || '[DATE]',
      '{ACCOUNT_NUMBER}': form.accountNumber || '[ACCOUNT #]',
      '{PROVIDER_NAME}': form.provider || '[FACILITY]',
      '{PATIENT_NAME}': form.name || '[NAME]'
    };
    Object.entries(map).forEach(([k, v]) => body = body.split(k).join(v));
    return body;
  }, [selected, form]);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div className="space-y-8 no-print">
        <div className="space-y-2">
          <h1 className="text-4xl font-display font-bold">Dispute Generator</h1>
          <p className="text-muted-foreground">Professional templates pre-filled with your audit results.</p>
        </div>
        <div className="space-y-4">
          <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Select Template</Label>
          {templates.map(t => (
            <button key={t.id} onClick={() => setSelected(t)} className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selected.id === t.id ? 'border-primary bg-primary/5' : 'border-border'}`}>
              <p className="font-bold text-sm">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.description}</p>
            </button>
          ))}
        </div>
        <Card className="p-6 space-y-4 bg-muted/20">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><Label>Full Name</Label><Input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} /></div>
            <div className="space-y-1"><Label>Account #</Label><Input value={form.accountNumber} onChange={e => setForm(f => ({...f, accountNumber: e.target.value}))} /></div>
            <div className="space-y-1"><Label>Facility</Label><Input value={form.provider} onChange={e => setForm(f => ({...f, provider: e.target.value}))} /></div>
            <div className="space-y-1"><Label>Date of Service</Label><Input value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} /></div>
          </div>
        </Card>
      </div>
      <div className="space-y-6">
        <div className="flex justify-between items-center no-print">
          <h2 className="text-2xl font-bold">Preview</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(letterBody); toast.success('Copied'); }}><Copy className="h-4 w-4 mr-2" /> Copy</Button>
            <Button size="sm" onClick={() => window.print()}><Printer className="h-4 w-4 mr-2" /> Print</Button>
          </div>
        </div>
        <Card className="p-12 font-serif text-black bg-white shadow-xl min-h-[600px]">
          <div className="space-y-8">
            <div className="text-right text-xs"><p>{form.city}, {form.state} - {new Date().toLocaleDateString()}</p></div>
            <p className="font-bold">{form.name || "[NAME]"}</p>
            <p className="font-bold underline text-center uppercase py-4">Billing Dispute Notice</p>
            <p className="whitespace-pre-wrap">{letterBody}</p>
            <div className="pt-12"><p>Sincerely,</p><p className="mt-8 font-bold border-t border-black w-48 pt-2">{form.name || "Signature"}</p></div>
          </div>
        </Card>
      </div>
    </div>
  );
}