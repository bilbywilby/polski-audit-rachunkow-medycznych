import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LETTER_TEMPLATES } from '@/data/constants';
import { Copy, Printer, FileText } from 'lucide-react';
import { toast } from 'sonner';
export function LettersPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(LETTER_TEMPLATES[0]);
  const [formData, setFormData] = useState({
    name: '',
    provider: '',
    accountNumber: '',
    dateOfService: '',
    amountDisputed: ''
  });
  const handleCopy = () => {
    const text = document.getElementById('letter-preview')?.innerText;
    if (text) {
      navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    }
  };
  const handlePrint = () => window.print();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6 no-print">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Letter Generator</h1>
          <p className="text-muted-foreground">Customize a professional dispute letter using our templates.</p>
        </div>
        <div className="space-y-4">
          <Label>Select Template</Label>
          <div className="grid grid-cols-1 gap-3">
            {LETTER_TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTemplate(t)}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  selectedTemplate.id === t.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/20'
                }`}
              >
                <p className="font-bold">{t.name}</p>
                <p className="text-sm text-muted-foreground">{t.description}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-4 border rounded-xl p-6 bg-muted/20">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <FileText className="h-4 w-4" /> Fill Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="Jane Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="provider">Provider Name</Label>
              <Input id="provider" value={formData.provider} onChange={e => setFormData(prev => ({ ...prev, provider: e.target.value }))} placeholder="Central PA Hospital" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="acc">Account #</Label>
              <Input id="acc" value={formData.accountNumber} onChange={e => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))} placeholder="12345678" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date of Service</Label>
              <Input id="date" value={formData.dateOfService} onChange={e => setFormData(prev => ({ ...prev, dateOfService: e.target.value }))} placeholder="MM/DD/YYYY" />
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <div className="flex justify-between items-center no-print">
          <h2 className="text-xl font-bold">Preview</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-2" /> Copy
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" /> Print
            </Button>
          </div>
        </div>
        <Card className="min-h-[600px] shadow-lg print:shadow-none print:border-none">
          <CardContent className="p-8 md:p-12 font-serif text-sm leading-relaxed" id="letter-preview">
            <div className="space-y-8">
              <div className="text-right">
                <p>Date: {new Date().toLocaleDateString()}</p>
              </div>
              <div className="space-y-1">
                <p className="font-bold">{formData.name || "[Your Name]"}</p>
                <p>[Your Address]</p>
                <p>[City, PA Zip Code]</p>
              </div>
              <div className="space-y-1">
                <p>To: Billing Department</p>
                <p className="font-bold">{formData.provider || "[Provider Name]"}</p>
                <p>[Provider Address]</p>
              </div>
              <div className="space-y-4">
                <p className="font-bold underline">RE: Formal Dispute of Bill - Account #{formData.accountNumber || "[XXXX]"}</p>
                <p>To Whom It May Concern,</p>
                <p>
                  I am writing to formally dispute the charges on my bill for services rendered on 
                  <strong> {formData.dateOfService || "[Date]"}</strong>. After reviewing my bill, 
                  I have identified concerns regarding the accuracy and legality of the billed amounts.
                </p>
                {selectedTemplate.id === 'general-dispute' && (
                  <p>
                    I am requesting an itemized bill with CPT and ICD-10 codes for every line item. 
                    I believe there are errors in the coding of these services. Please place this account 
                    on hold while you investigate these discrepancies.
                  </p>
                )}
                {selectedTemplate.id === 'surprise-bill' && (
                  <p>
                    This bill appears to violate the <strong>No Surprises Act</strong> and Pennsylvania state law 
                    regarding out-of-network balance billing for emergency or non-consented services. 
                    Under these protections, I am only responsible for my in-network cost-sharing amounts.
                  </p>
                )}
                {selectedTemplate.id === 'financial-assistance' && (
                  <p>
                    I am requesting an application for financial assistance/charity care (HCAP) as per Pennsylvania 
                    regulations. I believe I am eligible for a reduction in charges based on my income level.
                  </p>
                )}
                <p>
                  Please respond to this dispute in writing within 30 days. Until this matter is resolved, 
                  I request that this account not be referred to any collection agency.
                </p>
                <div className="pt-8">
                  <p>Sincerely,</p>
                  <p className="mt-8 font-bold">{formData.name || "____________________"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}