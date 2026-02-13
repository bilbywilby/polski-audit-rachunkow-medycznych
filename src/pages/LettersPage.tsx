import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LETTER_TEMPLATES } from '@/data/constants';
import { Copy, Printer, FileText, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { AuditRecord } from '@/lib/db';
export function LettersPage() {
  const location = useLocation();
  const passedAudit = location.state?.audit as AuditRecord | undefined;
  const [selectedTemplate, setSelectedTemplate] = useState(LETTER_TEMPLATES[0]);
  const [formData, setFormData] = useState({
    name: '',
    provider: '',
    accountNumber: '',
    dateOfService: '',
    amountDisputed: passedAudit?.totalAmount.toString() || '',
    monthlyPayment: '50',
    startDate: new Date().toLocaleDateString()
  });
  useEffect(() => {
    if (passedAudit) {
      const hasSurprise = passedAudit.flags.some(f => f.type === 'balance-billing');
      const hasFinancial = passedAudit.totalAmount > 5000;
      if (hasSurprise) {
        setSelectedTemplate(LETTER_TEMPLATES.find(t => t.id === 'surprise-bill') || LETTER_TEMPLATES[0]);
      } else if (hasFinancial) {
        setSelectedTemplate(LETTER_TEMPLATES.find(t => t.id === 'financial-assistance') || LETTER_TEMPLATES[0]);
      }
      const dateMatch = passedAudit.rawText.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/);
      if (dateMatch) {
        setFormData(prev => ({ ...prev, dateOfService: dateMatch[0] }));
      }
    }
  }, [passedAudit]);
  const letterContent = useMemo(() => {
    let body = selectedTemplate.body;
    const replacements: Record<string, string> = {
      '[DATE_OF_SERVICE]': formData.dateOfService || '[DATE]',
      '[TOTAL_AMOUNT]': formData.amountDisputed || '0.00',
      '[PATIENT_NAME]': formData.name || '[YOUR NAME]',
      '[ACCOUNT_NUMBER]': formData.accountNumber || '[ACCOUNT #]',
      '[CPT_CODES]': passedAudit?.detectedCpt.join(', ') || '[CODES]',
      '[PROVIDER_NAME]': formData.provider || '[PROVIDER]',
      '[MONTHLY_PAYMENT]': formData.monthlyPayment,
      '[START_DATE]': formData.startDate
    };
    Object.entries(replacements).forEach(([key, val]) => {
      body = body.split(key).join(val);
    });
    return body;
  }, [selectedTemplate, formData, passedAudit]);
  const handleCopy = () => {
    const text = document.getElementById('letter-preview')?.innerText;
    if (text) {
      navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    }
  };
  const handlePrint = () => window.print();
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8 no-print">
            <div className="space-y-3">
              <h1 className="text-4xl font-display font-bold">Letter Generator</h1>
              <p className="text-muted-foreground">Professional dispute templates customized with audit data.</p>
              {passedAudit && (
                <div className="flex items-center gap-2 text-primary bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10 inline-flex">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-xs font-medium">Linked: {passedAudit.fileName}</span>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Select Template</Label>
              <div className="grid grid-cols-1 gap-2">
                {LETTER_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t)}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${
                      selectedTemplate.id === t.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/20'
                    }`}
                  >
                    <p className="font-bold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{t.description}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4 border rounded-2xl p-6 bg-muted/20">
              <h3 className="text-lg font-bold flex items-center gap-2"><FileText className="h-4 w-4" /> Personalize</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Full Name</Label><Input value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} /></div>
                <div className="space-y-1"><Label>Hospital</Label><Input value={formData.provider} onChange={e => setFormData(p => ({...p, provider: e.target.value}))} /></div>
                <div className="space-y-1"><Label>Invoice #</Label><Input value={formData.accountNumber} onChange={e => setFormData(p => ({...p, accountNumber: e.target.value}))} /></div>
                <div className="space-y-1"><Label>Service Date</Label><Input value={formData.dateOfService} onChange={e => setFormData(p => ({...p, dateOfService: e.target.value}))} /></div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex justify-between items-center no-print">
              <h2 className="text-2xl font-bold">Preview</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}><Copy className="h-4 w-4 mr-2" /> Copy</Button>
                <Button variant="default" size="sm" onClick={handlePrint}><Printer className="h-4 w-4 mr-2" /> Print</Button>
              </div>
            </div>
            <Card className="shadow-2xl print:shadow-none print:border-none rounded-none">
              <CardContent className="p-12 font-serif leading-relaxed text-black bg-white min-h-[700px]" id="letter-preview">
                <div className="space-y-8">
                  <div className="text-right text-xs"><p>Date: {new Date().toLocaleDateString()}</p></div>
                  <div><p className="font-bold">{formData.name || "[PATIENT NAME]"}</p><p>[ADDRESS LINE]</p></div>
                  <div className="pt-4"><p>Attn: Billing Dept</p><p className="font-bold">{formData.provider || "[PROVIDER NAME]"}</p></div>
                  <div className="pt-6 space-y-6">
                    <p className="font-bold underline text-center uppercase">Formal Dispute Notice</p>
                    <p>To Whom It May Concern,</p>
                    <p>{letterContent}</p>
                    <p>Please place this account in disputed status immediately. I expect a written response within 30 days.</p>
                    <div className="pt-12"><p>Sincerely,</p><p className="mt-8 font-bold">{formData.name || "____________________"}</p></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}