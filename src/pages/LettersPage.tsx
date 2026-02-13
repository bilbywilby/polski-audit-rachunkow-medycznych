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
import { useLanguage } from '@/hooks/use-language';
export function LettersPage() {
  const location = useLocation();
  const { language } = useLanguage();
  const passedAudit = location.state?.audit as AuditRecord | undefined;
  const templates = language === 'pl' ? LETTER_TEMPLATES.pl : (LETTER_TEMPLATES.en.length ? LETTER_TEMPLATES.en : LETTER_TEMPLATES.pl);
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);
  const [formData, setFormData] = useState({
    name: '',
    city: 'Warszawa',
    provider: passedAudit?.extractedData.providerName || '',
    accountNumber: passedAudit?.extractedData.accountNumber || '',
    dateOfService: passedAudit?.extractedData.dateOfService || '',
    amountDisputed: passedAudit?.totalAmount ? `${passedAudit.totalAmount.toLocaleString()}` : '',
    startDate: '',
    endDate: '',
    raty: '6',
    kwotaRaty: '200'
  });
  useEffect(() => {
    if (passedAudit) {
      if (passedAudit.overcharges.length > 0) {
        const t = templates.find(t => t.id === 'pl-coding-dispute');
        if (t) setSelectedTemplate(t);
      }
    }
  }, [passedAudit, templates]);
  const letterContent = useMemo(() => {
    let body = selectedTemplate.body;
    const benchmarkComparison = passedAudit?.overcharges?.length
      ? passedAudit.overcharges.map(o => `Procedura ${o.code}: Średnia ${o.benchmarkAmount} PLN vs Naliczono ${o.billedAmount} PLN (+${o.percentOver}%)`).join('; ')
      : (language === 'pl' ? 'Kwota znacząco odbiega od standardowych stawek.' : 'Amount significantly exceeds benchmarks.');
    const replacements: Record<string, string> = {
      '{SERVICE_DATE}': formData.dateOfService || '[DATA USŁUGI]',
      '{TOTAL_AMOUNT}': formData.amountDisputed || '[KWOTA]',
      '{CODE_LIST}': passedAudit?.detectedCpt?.length ? passedAudit.detectedCpt.join(', ') : '[KODY]',
      '{BENCHMARK_COMPARISON}': benchmarkComparison,
      '{ACCOUNT_NUMBER}': formData.accountNumber || '[NR KONTA/FAKTURY]',
      '{PROVIDER_NAME}': formData.provider || '[PLACÓWKA]',
      '{PATIENT_NAME}': formData.name || '[IMIĘ I NAZWISKO]',
      '{CITY}': formData.city,
      '{CURRENT_DATE}': new Date().toLocaleDateString('pl-PL'),
      '{START_DATE}': formData.startDate || '[OD]',
      '{END_DATE}': formData.endDate || '[DO]',
      '{RATY}': formData.raty,
      '{KWOTA}': formData.kwotaRaty
    };
    Object.entries(replacements).forEach(([key, val]) => {
      body = body.split(key).join(val || key);
    });
    return body;
  }, [selectedTemplate, formData, passedAudit, language]);
  const handleCopy = () => {
    const text = document.getElementById('letter-preview-content')?.innerText;
    if (text) {
      navigator.clipboard.writeText(text);
      toast.success(language === 'pl' ? 'Skopiowano' : 'Copied');
    }
  };
  const handlePrint = () => window.print();
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8 no-print">
            <div className="space-y-3">
              <h1 className="text-4xl font-display font-bold">{language === 'pl' ? 'Generator Pism' : 'Letter Generator'}</h1>
              <p className="text-muted-foreground">{language === 'pl' ? 'Szablony oparte o polskie prawo pacjenta.' : 'Templates based on patient rights.'}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">
                  <ShieldCheck className="h-3 w-3 mr-1" /> RODO Safe
                </Badge>
              </div>
            </div>
            <div className="space-y-4">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{language === 'pl' ? 'Wybierz Szablon' : 'Select Template'}</Label>
              <div className="grid grid-cols-1 gap-2">
                {templates.map((t) => (
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
              <h3 className="text-lg font-bold flex items-center gap-2"><FileText className="h-4 w-4" /> {language === 'pl' ? 'Personalizuj' : 'Personalize'}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Imię i Nazwisko</Label>
                  <Input value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} />
                </div>
                <div className="space-y-1">
                  <Label>Miejscowość</Label>
                  <Input value={formData.city} onChange={e => setFormData(p => ({...p, city: e.target.value}))} />
                </div>
                <div className="space-y-1">
                  <Label>Placówka</Label>
                  <Input value={formData.provider} onChange={e => setFormData(p => ({...p, provider: e.target.value}))} />
                </div>
                <div className="space-y-1">
                  <Label>Nr konta/faktury</Label>
                  <Input value={formData.accountNumber} onChange={e => setFormData(p => ({...p, accountNumber: e.target.value}))} />
                </div>
                <div className="space-y-1">
                  <Label>Data usługi</Label>
                  <Input placeholder="DD.MM.YYYY" value={formData.dateOfService} onChange={e => setFormData(p => ({...p, dateOfService: e.target.value}))} />
                </div>
                <div className="space-y-1">
                  <Label>Kwota</Label>
                  <Input value={formData.amountDisputed} onChange={e => setFormData(p => ({...p, amountDisputed: e.target.value}))} />
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex justify-between items-center no-print">
              <h2 className="text-2xl font-bold">{language === 'pl' ? 'Podgląd' : 'Preview'}</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy} className="rounded-xl">
                  <Copy className="h-4 w-4 mr-2" /> {language === 'pl' ? 'Kopiuj' : 'Copy'}
                </Button>
                <Button variant="default" size="sm" onClick={handlePrint} className="rounded-xl shadow-md">
                  <Printer className="h-4 w-4 mr-2" /> {language === 'pl' ? 'Drukuj' : 'Print'}
                </Button>
              </div>
            </div>
            <Card className="shadow-2xl print:shadow-none print:border-none rounded-none border-t-4 border-t-primary">
              <CardContent className="p-8 md:p-12 font-serif leading-relaxed text-black bg-white min-h-[800px] relative" id="letter-preview">
                <div className="space-y-8" id="letter-preview-content">
                  <div className="text-right text-xs">
                    <p>{formData.city}, {new Date().toLocaleDateString('pl-PL')}</p>
                  </div>
                  <div>
                    <p className="font-bold">{formData.name || "[IMIĘ I NAZWISKO]"}</p>
                    <p>[ADRES ZAMIESZKANIA]</p>
                  </div>
                  <div className="pt-4">
                    <p>Do: Dział Rozliczeń / Dyrekcja</p>
                    <p className="font-bold">{formData.provider || "[NAZWA PLACÓWKI]"}</p>
                  </div>
                  <div className="pt-6 space-y-6">
                    <p className="font-bold underline text-center uppercase tracking-wider">REKLAMACJA / WEZWANIE DO WYJAŚNIENIA ROZLICZENIA</p>
                    <p>Szanowni Państwo,</p>
                    <p className="whitespace-pre-wrap">{letterContent}</p>
                    <p>Proszę o pisemne odniesienie się do powyższego zgłoszenia w terminie 14 dni roboczych. Zastrzegam sobie prawo do powiadomienia Rzecznika Praw Pacjenta w przypadku braku wyjaśnień.</p>
                    <div className="pt-12">
                      <p>Z poważaniem,</p>
                      <p className="mt-8 font-bold border-t border-black w-48 pt-2">{formData.name || "Podpis"}</p>
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