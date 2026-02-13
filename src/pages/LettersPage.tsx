import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
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
    amountDisputed: passedAudit?.totalAmount.toString() || ''
  });
  useEffect(() => {
    if (passedAudit) {
      // Logic to pick best template
      const hasSurprise = passedAudit.flags.some(f => f.type === 'balance-billing');
      if (hasSurprise) {
        const t = LETTER_TEMPLATES.find(t => t.id === 'surprise-bill');
        if (t) setSelectedTemplate(t);
      }
      // Try to extract date from raw text if possible (simple regex)
      const dateMatch = passedAudit.rawText.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/);
      if (dateMatch) {
        setFormData(prev => ({ ...prev, dateOfService: dateMatch[0] }));
      }
      toast.success('Audit data integrated', {
        description: 'Letter fields have been pre-filled from your audit results.'
      });
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
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8 no-print">
            <div className="space-y-3">
              <h1 className="text-4xl font-display font-bold">Letter Generator</h1>
              <p className="text-lg text-muted-foreground">Professional dispute templates customized with your audit findings.</p>
              {passedAudit && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-950/20 px-3 py-2 rounded-lg border border-green-200 inline-block">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Synced with Audit: {passedAudit.fileName}</span>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Select Dispute Type</Label>
              <div className="grid grid-cols-1 gap-3">
                {LETTER_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t)}
                    className={`text-left p-5 rounded-2xl border-2 transition-all shadow-sm ${
                      selectedTemplate.id === t.id ? 'border-primary bg-primary/5 ring-4 ring-primary/5' : 'border-border hover:border-primary/20 hover:bg-muted/30'
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
                <FileText className="h-5 w-5 text-primary" /> Recipient & Patient Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Patient Full Name</Label>
                  <Input id="name" value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="Jane Doe" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="provider">Health System / Hospital</Label>
                  <Input id="provider" value={formData.provider} onChange={e => setFormData(prev => ({ ...prev, provider: e.target.value }))} placeholder="Main Line Health" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="acc">Account / Invoice #</Label>
                  <Input id="acc" value={formData.accountNumber} onChange={e => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))} placeholder="882104" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date of Service</Label>
                  <Input id="date" value={formData.dateOfService} onChange={e => setFormData(prev => ({ ...prev, dateOfService: e.target.value }))} placeholder="MM/DD/YYYY" className="rounded-xl" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="amount">Amount to Dispute ($)</Label>
                  <Input id="amount" value={formData.amountDisputed} onChange={e => setFormData(prev => ({ ...prev, amountDisputed: e.target.value }))} placeholder="0.00" className="rounded-xl" />
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex justify-between items-center no-print">
              <h2 className="text-2xl font-bold font-display">Letter Preview</h2>
              <div className="flex gap-2">
                <Button variant="outline" className="rounded-xl" onClick={handleCopy}>
                  <Copy className="h-4 w-4 mr-2" /> Copy Text
                </Button>
                <Button variant="default" className="rounded-xl" onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-2" /> Print Letter
                </Button>
              </div>
            </div>
            <Card className="min-h-[800px] shadow-2xl rounded-none print:shadow-none print:border-none print:m-0 print:p-0">
              <CardContent className="p-12 md:p-16 font-serif text-[16px] leading-[1.6] text-black bg-white" id="letter-preview">
                <div className="space-y-10">
                  <div className="text-right">
                    <p>Date: {new Date().toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold uppercase tracking-wide">{formData.name || "[Patient Name]"}</p>
                    <p>[Your Address]</p>
                    <p>[City, PA Zip Code]</p>
                  </div>
                  <div className="space-y-1">
                    <p>To: Billing Department</p>
                    <p className="font-bold">{formData.provider || "[Provider Name]"}</p>
                    <p>[Provider Address]</p>
                  </div>
                  <div className="space-y-6">
                    <p className="font-bold underline text-center text-lg">RE: Formal Dispute of Bill - Account #{formData.accountNumber || "[XXXX]"}</p>
                    <p>To Whom It May Concern,</p>
                    <p>
                      I am writing to formally dispute the charges on my medical bill for services rendered on
                      <strong> {formData.dateOfService || "[Date]"}</strong>. After conducting a thorough audit of the billed items,
                      I have identified specific discrepancies that I believe are incorrect or violate consumer protection laws.
                    </p>
                    {selectedTemplate.id === 'general-dispute' && (
                      <div className="space-y-4">
                        <p>
                          I am requesting an itemized bill that includes the specific CPT (Current Procedural Terminology) and 
                          ICD-10 codes for every line item. I have reason to believe that the level of coding assigned 
                          (e.g., upcoding) does not accurately reflect the medical decision-making complexity of my visit.
                        </p>
                        {passedAudit && passedAudit.flags.length > 0 && (
                          <div className="pl-6 border-l-4 border-gray-200 py-2 italic text-gray-700">
                            <strong>Audit Flag:</strong> {passedAudit.flags[0].description}
                          </div>
                        )}
                      </div>
                    )}
                    {selectedTemplate.id === 'surprise-bill' && (
                      <div className="space-y-4">
                        <p>
                          This bill appears to violate the <strong>No Surprises Act</strong> and corresponding Pennsylvania 
                          consumer protections regarding out-of-network balance billing. Under these laws, I am only 
                          responsible for my in-network cost-sharing amounts for emergency services or services 
                          provided at an in-network facility where I did not provide informed consent for out-of-network care.
                        </p>
                        <p>The disputed amount of <strong>${formData.amountDisputed || "[Amount]"}</strong> exceeds my required cost-sharing.</p>
                      </div>
                    )}
                    {selectedTemplate.id === 'financial-assistance' && (
                      <div className="space-y-4">
                        <p>
                          I am requesting a formal application and evaluation for your hospital's Financial Assistance 
                          Policy/Charity Care program (HCAP) as required by Pennsylvania and Federal guidelines. 
                          I believe I meet the eligibility criteria for a significant reduction or waiver of these charges.
                        </p>
                      </div>
                    )}
                    <p>
                      Please investigate this matter and provide a written response within thirty (30) days. Until this 
                      matter is resolved, I request that this account be placed in "disputed" status and not be 
                      referred to any third-party collection agency or reported to credit bureaus.
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