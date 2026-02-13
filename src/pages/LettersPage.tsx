import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { LETTER_TEMPLATES } from '@/data/constants';
import { Copy, Printer, FileText, ShieldCheck, Lock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { AuditRecord } from '@/lib/db';
export function LettersPage() {
  const location = useLocation();
  const passedAudit = location.state?.audit as AuditRecord | undefined;
  const [selectedTemplate, setSelectedTemplate] = useState(LETTER_TEMPLATES[0]);
  const [formData, setFormData] = useState({
    name: '',
    provider: passedAudit?.extractedData.providerName || '',
    accountNumber: passedAudit?.extractedData.accountNumber || '',
    dateOfService: passedAudit?.extractedData.dateOfService || '',
    amountDisputed: passedAudit?.totalAmount ? `$${passedAudit.totalAmount.toLocaleString()}` : '',
    policyInfo: passedAudit?.extractedData.policyId ? `Member ID: ${passedAudit.extractedData.policyId}` : ''
  });
  useEffect(() => {
    if (passedAudit) {
      const hasSurprise = passedAudit.flags.some(f => f.type === 'balance-billing');
      if (hasSurprise) {
        setSelectedTemplate(LETTER_TEMPLATES.find(t => t.id === 'no-surprises-act') || LETTER_TEMPLATES[0]);
      } else if (passedAudit.overcharges.length > 0) {
        setSelectedTemplate(LETTER_TEMPLATES.find(t => t.id === 'surprise-dispute') || LETTER_TEMPLATES[0]);
      }
    }
  }, [passedAudit]);
  const letterContent = useMemo(() => {
    let body = selectedTemplate.body;
    const benchmarkComparison = passedAudit?.overcharges?.length
      ? passedAudit.overcharges.map(o => `CPT ${o.code}: PA Avg $${o.benchmarkAmount} vs Billed $${o.billedAmount} (+${o.percentOver}%)`).join('; ')
      : 'Billed amount significantly exceeds regional benchmarks for services performed.';
    const replacements: Record<string, string> = {
      '{SERVICE_DATE}': formData.dateOfService || '[SERVICE DATE]',
      '{TOTAL_AMOUNT}': formData.amountDisputed || '[TOTAL AMOUNT]',
      '{CODE_LIST}': passedAudit?.detectedCpt?.length ? passedAudit.detectedCpt.join(', ') : '[CODES]',
      '{BENCHMARK_COMPARISON}': benchmarkComparison,
      '{POLICY_INFO}': formData.policyInfo || '[POLICY INFO]',
      '{ACCOUNT_NUMBER}': formData.accountNumber || '[ACCOUNT #]',
      '{PROVIDER_NAME}': formData.provider || '[PROVIDER]',
      '{PATIENT_NAME}': formData.name || '[PATIENT NAME]'
    };
    Object.entries(replacements).forEach(([key, val]) => {
      body = body.split(key).join(val || key);
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
  const missingFields = Object.entries({
    'Patient Name': formData.name,
    'Service Date': formData.dateOfService,
    'Provider': formData.provider,
    'Account Number': formData.accountNumber
  }).filter(([_, val]) => !val);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8 no-print">
            <div className="space-y-3">
              <h1 className="text-4xl font-display font-bold">Letter Generator</h1>
              <p className="text-muted-foreground">Professional templates using smart extraction data.</p>
              <div className="flex flex-wrap gap-2">
                {passedAudit && (
                  <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10">
                    Linked: {passedAudit.fileName.substring(0, 15)}...
                  </Badge>
                )}
                <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">
                  <ShieldCheck className="h-3 w-3 mr-1" /> Privacy Mode
                </Badge>
              </div>
            </div>
            {missingFields.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-amber-900">Missing Information</p>
                  <p className="text-xs text-amber-700">Please fill in: {missingFields.map(f => f[0]).join(', ')}</p>
                </div>
              </div>
            )}
            <div className="space-y-4">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Templates</Label>
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
                <div className="space-y-1"><Label>Account #</Label><Input placeholder="Account/Invoice" value={formData.accountNumber} onChange={e => setFormData(p => ({...p, accountNumber: e.target.value}))} /></div>
                <div className="space-y-1"><Label>Date of Service</Label><Input placeholder="MM/DD/YYYY" value={formData.dateOfService} onChange={e => setFormData(p => ({...p, dateOfService: e.target.value}))} /></div>
                <div className="space-y-1"><Label>Billed Amount</Label><Input placeholder="$0.00" value={formData.amountDisputed} onChange={e => setFormData(p => ({...p, amountDisputed: e.target.value}))} /></div>
                <div className="space-y-1"><Label>Policy Details</Label><Input placeholder="Insurer/ID" value={formData.policyInfo} onChange={e => setFormData(p => ({...p, policyInfo: e.target.value}))} /></div>
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
              <CardContent className="p-8 md:p-12 font-serif leading-relaxed text-black bg-white min-h-[800px] relative" id="letter-preview">
                <div className="absolute top-4 right-4 text-[10px] text-muted-foreground/30 flex items-center gap-1 uppercase no-print">
                  <Lock className="h-2 w-2" /> Local Processing Only
                </div>
                <div className="space-y-8" id="letter-preview-content">
                  <div className="text-right text-xs"><p>Date: {new Date().toLocaleDateString()}</p></div>
                  <div>
                    <p className="font-bold">{formData.name || "[YOUR FULL NAME]"}</p>
                    <p>[YOUR STREET ADDRESS]</p>
                    <p>[YOUR CITY, PA ZIP]</p>
                  </div>
                  <div className="pt-4">
                    <p>Attn: Patient Billing / Billing Dispute Department</p>
                    <p className="font-bold">{formData.provider || "[PROVIDER ENTITY]"}</p>
                  </div>
                  <div className="pt-6 space-y-6">
                    <p className="font-bold underline text-center uppercase tracking-wider">OFFICIAL NOTICE OF BILLING DISPUTE</p>
                    <p>To Whom It May Concern,</p>
                    <p className="whitespace-pre-wrap">{letterContent}</p>
                    <p>Please acknowledge receipt of this dispute. I expect a written itemized response within 30 days. Until this matter is resolved, please ensure the account is not referred to collections.</p>
                    <div className="pt-12">
                      <p>Sincerely,</p>
                      <p className="mt-8 font-bold border-t border-black w-48 pt-2">{formData.name || "Signature"}</p>
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