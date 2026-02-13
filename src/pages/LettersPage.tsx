import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { LETTER_TEMPLATES } from '@/data/constants';
import { Copy, Printer, FileText, CheckCircle, ShieldCheck, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { AuditRecord } from '@/lib/db';
export function LettersPage() {
  const location = useLocation();
  const passedAudit = location.state?.audit as AuditRecord | undefined;
  const [selectedTemplate, setSelectedTemplate] = useState(LETTER_TEMPLATES[0]);
  const [formData, setFormData] = useState({
    name: '',
    provider: passedAudit?.extractedData.providerName || '',
    accountNumber: '',
    dateOfService: passedAudit?.extractedData.dateOfService || '',
    amountDisputed: passedAudit?.totalAmount.toString() || '',
    monthlyPayment: '50',
    startDate: new Date().toLocaleDateString()
  });
  useEffect(() => {
    if (passedAudit) {
      const hasSurprise = passedAudit.flags.some(f => f.type === 'balance-billing');
      const hasFinancial = (passedAudit.totalAmount ?? 0) > 3000;
      if (hasSurprise) {
        setSelectedTemplate(LETTER_TEMPLATES.find(t => t.id === 'surprise-bill') || LETTER_TEMPLATES[0]);
      } else if (hasFinancial) {
        setSelectedTemplate(LETTER_TEMPLATES.find(t => t.id === 'financial-assistance') || LETTER_TEMPLATES[0]);
      }
    }
  }, [passedAudit]);
  const letterContent = useMemo(() => {
    let body = selectedTemplate.body;
    const overchargesSummary = passedAudit?.overcharges?.length
      ? `Based on my audit, the following codes exceed local PA benchmarks: ${passedAudit.overcharges.map(o => `${o.code} (+${o.percentOver}%)`).join(', ')}.`
      : '';
    const replacements: Record<string, string> = {
      '[DATE_OF_SERVICE]': formData.dateOfService || '[DATE]',
      '[DATE_LIST]': passedAudit?.extractedData.allDates?.length 
        ? passedAudit.extractedData.allDates.join(', ') 
        : (formData.dateOfService || '[DATES]'),
      '[TOTAL_AMOUNT]': formData.amountDisputed || '0.00',
      '[PATIENT_NAME]': formData.name || '[YOUR NAME]',
      '[ACCOUNT_NUMBER]': formData.accountNumber || '[ACCOUNT #]',
      '[CPT_CODES]': passedAudit?.detectedCpt?.length ? passedAudit.detectedCpt.join(', ') : '[CODES]',
      '[PROVIDER_NAME]': formData.provider || '[PROVIDER]',
      '[MONTHLY_PAYMENT]': formData.monthlyPayment,
      '[START_DATE]': formData.startDate,
      '[OVERCHARGES_SUMMARY]': overchargesSummary
    };
    Object.entries(replacements).forEach(([key, val]) => {
      body = body.split(key).join(val);
    });
    return body;
  }, [selectedTemplate, formData, passedAudit]);
  const handleCopy = () => {
    const text = document.getElementById('letter-preview-content')?.innerText;
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
              <p className="text-muted-foreground">Professional dispute templates customized with your audit results.</p>
              <div className="flex flex-wrap gap-2">
                {passedAudit && (
                  <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10">
                    Linked: {passedAudit.fileName.substring(0, 20)}...
                  </Badge>
                )}
                <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Locally Encrypted
                </Badge>
              </div>
            </div>
            <div className="space-y-4">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Select Template</Label>
              <div className="grid grid-cols-1 gap-2">
                {LETTER_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t)}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${
                      selectedTemplate.id === t.id ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/20'
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Full Name</Label><Input placeholder="Your Name" value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} /></div>
                <div className="space-y-1"><Label>Hospital</Label><Input placeholder="Facility Name" value={formData.provider} onChange={e => setFormData(p => ({...p, provider: e.target.value}))} /></div>
                <div className="space-y-1"><Label>Invoice #</Label><Input placeholder="Account/Invoice" value={formData.accountNumber} onChange={e => setFormData(p => ({...p, accountNumber: e.target.value}))} /></div>
                <div className="space-y-1"><Label>Service Date</Label><Input placeholder="MM/DD/YYYY" value={formData.dateOfService} onChange={e => setFormData(p => ({...p, dateOfService: e.target.value}))} /></div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex justify-between items-center no-print">
              <h2 className="text-2xl font-bold">Preview</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy} className="rounded-xl"><Copy className="h-4 w-4 mr-2" /> Copy</Button>
                <Button variant="default" size="sm" onClick={handlePrint} className="rounded-xl shadow-md"><Printer className="h-4 w-4 mr-2" /> Print</Button>
              </div>
            </div>
            <Card className="shadow-2xl print:shadow-none print:border-none rounded-none border-t-4 border-t-primary">
              <CardContent className="p-8 md:p-12 font-serif leading-relaxed text-black bg-white min-h-[750px] relative" id="letter-preview">
                <div className="absolute top-4 right-4 text-[10px] text-muted-foreground/30 flex items-center gap-1 uppercase no-print">
                  <Lock className="h-2 w-2" /> Private Data Only
                </div>
                <div className="space-y-8" id="letter-preview-content">
                  <div className="text-right text-xs"><p>Date: {new Date().toLocaleDateString()}</p></div>
                  <div>
                    <p className="font-bold">{formData.name || "[PATIENT NAME]"}</p>
                    <p>[STREET ADDRESS]</p>
                    <p>[CITY, PA ZIP]</p>
                  </div>
                  <div className="pt-4">
                    <p>Attn: Patient Billing Department</p>
                    <p className="font-bold">{formData.provider || "[PROVIDER NAME]"}</p>
                  </div>
                  <div className="pt-6 space-y-6">
                    <p className="font-bold underline text-center uppercase tracking-wider">Formal Medical Billing Dispute</p>
                    <p>To Whom It May Concern,</p>
                    <p className="whitespace-pre-wrap">{letterContent}</p>
                    <p>Please place this account in disputed status immediately and cease any collection efforts. I expect a written itemized response within 30 days of this notice.</p>
                    <div className="pt-12">
                      <p>Sincerely,</p>
                      <p className="mt-8 font-bold border-t border-black w-48 pt-2">{formData.name || "[SIGNATURE]"}</p>
                    </div>
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