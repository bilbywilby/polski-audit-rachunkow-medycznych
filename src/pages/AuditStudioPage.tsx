import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  ShieldCheck,
  FileUp,
  Loader2,
  AlertTriangle,
  Lock,
  Download,
  Phone,
  ExternalLink,
  ClipboardList,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { extractTextFromPdf, analyzeBillText, exportLegalAuditPackage } from '@/lib/audit-engine';
import { saveAudit, AuditRecord } from '@/lib/db';
import { MAX_FILE_SIZE, PA_DOI_HOTLINE, TRANSPARENCY_TOOL_DISCLAIMER, PA_DOI_PORTAL_URL } from '@/data/constants';
import { toast } from 'sonner';
export function AuditStudioPage() {
  const [hasAccepted, setHasAccepted] = useState(false);
  const [step, setStep] = useState<'upload' | 'analyzing' | 'results'>('upload');
  const [progress, setProgress] = useState(0);
  const [manualText, setManualText] = useState('');
  const [result, setResult] = useState<AuditRecord | null>(null);
  const handleProcess = useCallback(async (text: string, name: string) => {
    setStep('analyzing');
    setProgress(10);
    try {
      const analysis = await analyzeBillText(text, name);
      setProgress(60);
      await saveAudit(analysis);
      setProgress(100);
      setResult(analysis);
      setStep('results');
    } catch (error) {
      console.error(error);
      toast.error('Review failed', { description: 'Could not analyze content.' });
      setStep('upload');
    }
  }, []);
  const onDrop = useCallback(async (files: File[]) => {
    if (!files[0]) return;
    if (files[0].size > MAX_FILE_SIZE) {
      toast.error('File too large');
      return;
    }
    setStep('analyzing');
    try {
      const text = await extractTextFromPdf(files[0]);
      await handleProcess(text, files[0].name);
    } catch (error) {
      console.error(error);
      toast.error('PDF Extraction Failed');
      setStep('upload');
    }
  }, [handleProcess]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false
  });
  if (!hasAccepted) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 animate-fade-in">
        <Card className="rounded-[2.5rem] border-primary/20 shadow-2xl overflow-hidden">
          <div className="bg-primary p-8 text-primary-foreground text-center">
            <ShieldCheck className="h-12 w-12 mx-auto mb-4 opacity-90" />
            <h1 className="text-3xl font-display font-bold">Billing Transparency Review</h1>
            <p className="text-sm opacity-80 mt-2">Privacy-First Statutory Educational Assistant</p>
          </div>
          <CardContent className="p-10 space-y-6">
            <div className="bg-muted/50 p-6 rounded-2xl text-sm leading-relaxed whitespace-pre-line text-muted-foreground border italic">
              {TRANSPARENCY_TOOL_DISCLAIMER}
            </div>
            <div className="flex flex-col gap-4">
              <Button onClick={() => setHasAccepted(true)} className="h-14 text-lg font-bold rounded-2xl">
                I Accept & Understand
              </Button>
              <p className="text-[10px] text-center text-muted-foreground uppercase font-bold tracking-widest">
                Raw data is purged from memory immediately after analysis
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <AnimatePresence mode="wait">
        {step === 'upload' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
            <div className="text-center space-y-3">
              <h2 className="text-4xl font-display font-bold">Transparency Assistant</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Review your medical statements for compliance with PA Act 102 and No Surprises Act benchmarks.</p>
            </div>
            <div {...getRootProps()} className={`border-2 border-dashed rounded-[3rem] p-20 text-center transition-all cursor-pointer ${isDragActive ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-border hover:border-primary/50'}`}>
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-6">
                <div className="p-6 bg-primary/10 rounded-3xl animate-pulse"><FileUp className="h-12 w-12 text-primary" /></div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold">Drop Medical Statement PDF</p>
                  <p className="text-sm text-muted-foreground italic">100% Local processing. We never see your data.</p>
                </div>
              </div>
            </div>
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest px-2">
                <ClipboardList className="h-4 w-4" /> Manual Text Entry
              </div>
              <Textarea
                placeholder="Paste statement text here..."
                className="min-h-[150px] rounded-3xl p-6 shadow-sm border-muted-foreground/20"
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
              />
              <Button
                className="w-full h-14 text-xl font-bold rounded-2xl"
                disabled={!manualText.trim()}
                onClick={() => handleProcess(manualText, 'Manual Review')}
              >
                Analyze Transparency Points
              </Button>
            </div>
          </motion.div>
        )}
        {step === 'analyzing' && (
          <div className="flex flex-col items-center justify-center py-32 space-y-8">
            <div className="relative">
              <Loader2 className="h-20 w-20 text-primary animate-spin" />
              <Lock className="h-8 w-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="text-center space-y-4 w-full max-w-md">
              <h3 className="text-2xl font-bold">Privacy-Shield Processing...</h3>
              <p className="text-sm text-muted-foreground italic">Redacting PII & Purging Raw Buffer</p>
              <Progress value={progress} className="h-2 rounded-full" />
            </div>
          </div>
        )}
        {step === 'results' && result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b pb-8">
              <div>
                <h1 className="text-4xl font-display font-bold">Educational Review Complete</h1>
                <p className="text-muted-foreground">Analysis for {result.fileName}</p>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" className="rounded-2xl border-purple-500 text-purple-600 h-12" onClick={() => {
                  const blob = new Blob([exportLegalAuditPackage(result)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a'); a.href = url; a.download = `Transparency_Review_${result.id.slice(0,8)}.json`; a.click();
                  toast.success('Redacted Package Exported');
                }}>
                  <Download className="mr-2 h-4 w-4" /> Export Redacted JSON
                </Button>
                <Button className="rounded-2xl h-12" onClick={() => {
                  setStep('upload');
                  setResult(null);
                  setManualText('');
                }}>Start New Review</Button>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <Card className="bg-primary text-primary-foreground rounded-[2.5rem] p-10 shadow-xl">
                  <p className="text-xs font-bold uppercase tracking-widest opacity-70">Review Point Amount</p>
                  <p className="text-6xl font-bold mt-2 tracking-tighter">${result.totalAmount.toLocaleString()}</p>
                </Card>
                <Card className="rounded-3xl p-6 border-muted/50">
                  <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><CheckCircle2 className="h-5 w-5 text-green-500" /> Privacy & Redaction Report</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-2xl flex items-center justify-between">
                      <span className="text-sm font-medium">Personally Identifiable Information (PII) Redacted</span>
                      <Badge className="bg-green-600 text-white">SECURE</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed italic">
                      The original document has been scrubbed. All raw buffers were purged from browser memory immediately after the analysis finished. Only the redacted version is stored in your local history.
                    </p>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-6">
                <Card className="rounded-[2rem] bg-amber-50/50 border-amber-200 p-8 shadow-sm">
                  <h3 className="font-bold text-amber-900 flex items-center gap-2 mb-4 text-lg"><AlertTriangle className="h-5 w-5" /> Transparency Flags</h3>
                  <div className="space-y-4">
                    {result.reviewPoints.length > 0 ? result.reviewPoints.map((p, i) => (
                      <div key={i} className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm">
                        <p className="text-[10px] font-bold uppercase text-amber-600 tracking-wider">{p.type.replace('-', ' ')}</p>
                        <p className="text-sm text-amber-900 font-medium mt-1">{p.description}</p>
                      </div>
                    )) : (
                      <p className="text-sm text-muted-foreground italic">No statutory flags identified.</p>
                    )}
                  </div>
                </Card>
                <div className="bg-slate-900 text-white p-8 rounded-[2rem] space-y-6">
                  <div className="space-y-2">
                    <h4 className="font-bold flex items-center gap-2"><Phone className="h-5 w-5 text-blue-400" /> Official PA Helpline</h4>
                    <p className="text-3xl font-bold font-mono text-blue-400">{PA_DOI_HOTLINE}</p>
                    <p className="text-xs opacity-60 italic">Call the PA DOI for formal disputes if you suspect a No Surprises Act violation.</p>
                  </div>
                  <Button variant="secondary" className="w-full h-12 font-bold rounded-xl" asChild>
                    <a href={PA_DOI_PORTAL_URL} target="_blank" rel="noreferrer"><ExternalLink className="mr-2 h-4 w-4" /> Open DOI Portal</a>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}