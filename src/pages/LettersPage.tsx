import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LETTER_TEMPLATES } from '@/data/constants';
import { Copy, Printer, FileText, CheckCircle, Info } from 'lucide-react';
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
    amountDisputed: passedAudit?.totalAmount.toString() || ''
  });
  useEffect(() => {
    if (passedAudit) {
      const hasSurprise = passedAudit.flags.some(f => f.type === 'balance-billing');
      const hasFinancial = passedAudit.totalAmount > 5000;
      if (hasSurprise) {
        const t = LETTER_TEMPLATES.find(t => t.id === 'surprise-bill');
        if (t) setSelectedTemplate(t);
      } else if (hasFinancial) {
        const t = LETTER_TEMPLATES.find(t => t.id === 'financial-assistance');
        if (t) setSelectedTemplate(t);
      }
      const dateMatch = passedAudit.rawText.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/);
      if (dateMatch) {
        setFormData(prev => ({ ...prev, dateOfService: dateMatch[0] }));
      }
      toast.success('Audit data integrated');
    }
  }, [passedAudit]);
  const handleCopy = () => {
    const text = document.getElementById('letter-preview')?.innerText;
    if (text) {
      navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    }
  };
  const handlePrint = () => window.print();
  const renderContextualParagraphs = () => {
    if (!passedAudit) return null;
    const hasFacilityFee = passedAudit.flags.some(f => f.type === 'facility-fee');
    const hasUnbundling = passedAudit.flags.some(f => f.type === 'unbundling');
    return (
      <div className="space-y-4 my-6 italic border-l-4 border-primary/20 pl-6 text-gray-700">
        {hasFacilityFee && (
          <p>
            Furthermore, I am disputing the "Facility Fee" associated with this visit. Under Pennsylvania 
            Act 32 and Hospital Transparency requirements, patients must be notified of such fees. I request 
            that this charge be waived as it does not represent a professional medical service provided by a physician.
          </p>
        )}
        {hasUnbundling && (
          <p>
            My audit indicates potential "unbundling" of CPT codes. Standard medical billing practices require 
            related procedures to be grouped under a single comprehensive code. I request a review of these 
            charges to ensure they comply with NCCI (National Correct Coding Initiative) edits.
          </p>
        )}
      </div>
    );
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8 no-print">
            <div className="space-y-3">
              <h1 className="text-4xl font-display font-bold">Letter Generator</h1>
              <p className="text-lg text-muted-foreground">Professional dispute templates customized with your audit findings.</p>
              {passedAudit && (
                <div className="flex items-center gap-2 text-primary bg-primary/5 px-3 py-2 rounded-xl border border-primary/10 inline-flex">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Linked to: {passedAudit.fileName}</span>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Dispute Type</Label>
              <div className="grid grid-cols-1 gap-3">
                {LETTER_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t)}
                    className={`text-left p-5 rounded-2xl border-2 transition-all ${
                      selectedTemplate.id === t.id ? 'border-primary bg-primary/5 ring-4 ring-primary/5' : 'border-border hover:border-primary/20'
                    }`}
                  >
                    <p className="font-bold text-lg">{t.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">{t.description}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-6 border rounded-3xl p-8 bg-muted/20">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Patient Name</Label>
                  <Input id="name" value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="Jane Doe" className="rounded-xl h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="provider">Provider/Hospital</Label>
                  <Input id="provider" value={formData.provider} onChange={e => setFormData(prev => ({ ...prev, provider: e.target.value }))} placeholder="Health System" className="rounded-xl h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="acc">Invoice #</Label>
                  <Input id="acc" value={formData.accountNumber} onChange={e => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))} placeholder="123456" className="rounded-xl h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Service Date</Label>
                  <Input id="date" value={formData.dateOfService} onChange={e => setFormData(prev => ({ ...prev, dateOfService: e.target.value }))} placeholder="MM/DD/YYYY" className="rounded-xl h-11" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="amount">Disputed Amount ($)</Label>
                  <Input id="amount" value={formData.amountDisputed} onChange={e => setFormData(prev => ({ ...prev, amountDisputed: e.target.value }))} placeholder="0.00" className="rounded-xl h-11" />
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex justify-between items-center no-print">
              <h2 className="text-2xl font-bold font-display">Preview</h2>
              <div className="flex gap-2">
                <Button variant="outline" className="rounded-xl" onClick={handleCopy}>
                  <Copy className="h-4 w-4 mr-2" /> Copy
                </Button>
                <Button variant="default" className="rounded-xl px-6" onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-2" /> Print
                </Button>
              </div>
            </div>
            <Card className="min-h-[850px] shadow-2xl rounded-none print:shadow-none print:border-none">
              <CardContent className="p-12 md:p-16 font-serif text-[15px] leading-[1.6] text-black bg-white" id="letter-preview">
                <div className="space-y-8">
                  <div className="text-right text-sm">
                    <p>Date: {new Date().toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold uppercase">{formData.name || "[Patient Name]"}</p>
                    <p>[Street Address]</p>
                    <p>[City, PA Zip Code]</p>
                  </div>
                  <div className="space-y-1 pt-4">
                    <p>Attn: Billing Department</p>
                    <p className="font-bold">{formData.provider || "[Provider Name]"}</p>
                    <p>[Provider Address]</p>
                  </div>
                  <div className="space-y-6 pt-6">
                    <p className="font-bold underline text-center">RE: FORMAL DISPUTE - INVOICE #{formData.accountNumber || "[XXXX]"}</p>
                    <p>To Whom It May Concern,</p>
                    <p>
                      I am writing to formally dispute charges for services rendered on 
                      <strong> {formData.dateOfService || "[Date]"}</strong>. My personal audit of these charges 
                      suggests significant billing errors that require immediate attention.
                    </p>
                    {selectedTemplate.id === 'general-dispute' && (
                      <p>
                        I request a full itemized bill with CPT and ICD-10 codes. I believe specific 
                        coding levels do not reflect the complexity of the visit.
                      </p>
                    )}
                    {selectedTemplate.id === 'surprise-bill' && (
                      <p>
                        This bill appears to violate the <strong>No Surprises Act</strong>. As I received 
                        emergency care, I am only responsible for my in-network cost-sharing amount. The 
                        current balance of <strong>${formData.amountDisputed}</strong> is incorrect under federal law.
                      </p>
                    )}
                    {selectedTemplate.id === 'financial-assistance' && (
                      <p>
                        I am requesting an application for Financial Assistance (Charity Care) as per 
                        hospital policy and Pennsylvania state guidelines.
                      </p>
                    )}
                    {renderContextualParagraphs()}
                    <p>
                      Please place this account in "disputed" status. Do not refer this to collections 
                      while this investigation is pending. I look forward to your written response within 30 days.
                    </p>
                    <div className="pt-12">
                      <p>Sincerely,</p>
                      <p className="mt-12 font-bold">{formData.name || "____________________"}</p>
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