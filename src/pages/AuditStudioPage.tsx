import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  FileUp,
  Loader2,
  AlertTriangle,
  ClipboardList,
  ShieldCheck,
  Gavel,
  Download,
  Lock,
  Phone,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { extractTextFromPdf, analyzeBillText, generateDocumentFingerprint, exportLegalAuditPackage } from '@/lib/audit-engine';
import { saveAudit, AuditRecord, findAuditByFingerprint } from '@/lib/db';
import { MAX_FILE_SIZE, PA_DOH_HOTLINE, PA_DOI_HOTLINE, PA_DOI_DISCLAIMER, PA_DOI_PORTAL_URL } from '@/data/constants';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
type Step = 'upload' | 'analyzing' | 'results';
export function AuditStudioPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('upload');
  const [progress, setProgress] = useState(0);
  const [manualText, setManualText] = useState('');
  const [result, setResult] = useState<AuditRecord | null>(null);
  const processText = useCallback(async (text: string, name: string) => {
    setStep('analyzing');
    setProgress(10);
    try {
      const fingerprint = await generateDocumentFingerprint(text);
      const existing = await findAuditByFingerprint(fingerprint);
      if (existing) {
        toast.info('Duplicate Bill Detected', {
          description: 'This document has already been reviewed.',
          action: { label: 'View Existing', onClick: () => navigate(`/audit/${existing.id}`) }
        });
      }
      setProgress(30);
      const analysis = await analyzeBillText(text, name);
      // MEMORY PURGE: Zero-out the raw text before persistence and state updates
      analysis.rawText = null;
      setProgress(70);
      await saveAudit(analysis);
      setProgress(100);
      setResult(analysis);
      setStep('results');
    } catch (error) {
      console.error(error);
      toast.error('Review failed', { description: error instanceof Error ? error.message : 'Could not analyze input.' });
      setStep('upload');
    }
  }, [navigate]);
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File too large', { description: 'Files must be under 10MB.' });
      return;
    }
    setStep('analyzing');
    setProgress(10);
    try {
      const text = await extractTextFromPdf(file);
      await processText(text, file.name);
    } catch (error) {
      console.error(error);
      toast.error('Upload failed', { description: 'Could not parse PDF. Use manual entry.' });
      setStep('upload');
    }
  }, [processText]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false
  });
  const handleLegalExport = () => {
    if (!result) return;
    const blob = new Blob([exportLegalAuditPackage(result)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Patient_Education_Review_${result.id.substring(0, 8)}.json`;
    a.click();
    toast.success('Education Review Package Exported');
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12">
        <AnimatePresence mode="wait">
          {step === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-4xl mx-auto space-y-8">
              <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-3xl p-8 text-white shadow-2xl border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10"><Lock className="h-32 w-32 -mr-10 -mt-10" /></div>
                <div className="relative z-10 space-y-4">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="h-16 w-16 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center border border-white/20">
                      <ShieldCheck className="h-8 w-8 text-blue-400" />
                    </div>
                    <div className="flex-1 space-y-1 text-center md:text-left">
                      <h3 className="text-xl font-bold tracking-tight uppercase">Patient Education Sandbox</h3>
                      <p className="text-sm text-slate-300 leading-relaxed italic">{PA_DOI_DISCLAIMER}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 pt-4 border-t border-white/10">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                      <Phone className="h-5 w-5 text-indigo-400" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">PA DOI Helpline</p>
                        <p className="text-sm font-mono font-bold">{PA_DOI_HOTLINE}</p>
                      </div>
                    </div>
                    <Button variant="outline" className="h-full rounded-2xl border-white/20 text-white hover:bg-white/10" asChild>
                       <a href={PA_DOI_PORTAL_URL} target="_blank" rel="noreferrer"><ExternalLink className="mr-2 h-4 w-4" /> DOI Portal</a>
                    </Button>
                  </div>
                </div>
              </div>
              <div className="text-center space-y-2">
                <h1 className="text-5xl font-display font-bold">Education Assistant</h1>
                <p className="text-muted-foreground text-lg">Statutory review for Pennsylvania healthcare transparency.</p>
              </div>
              <div {...getRootProps()} className={`border-2 border-dashed rounded-[2.5rem] p-20 text-center transition-all cursor-pointer ${isDragActive ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-border hover:border-primary/50'}`}>
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-6">
                  <div className="p-6 bg-primary/10 rounded-3xl"><FileUp className="h-12 w-12 text-primary" /></div>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold">Upload Medical Statement PDF</p>
                    <p className="text-muted-foreground text-sm max-w-sm mx-auto">100% Local privacy. Raw PII is purged immediately after analysis.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <Textarea placeholder="Paste billing text for educational analysis..." className="min-h-[150px] rounded-3xl p-6" value={manualText} onChange={(e) => setManualText(e.target.value)} />
                <Button className="w-full h-14 text-xl font-bold rounded-2xl" disabled={!manualText.trim()} onClick={() => processText(manualText, 'Manual Entry')}>Analyze Education Points</Button>
              </div>
            </motion.div>
          )}
          {step === 'analyzing' && (
            <motion.div key="analyzing" className="flex flex-col items-center justify-center py-32 space-y-8">
              <div className="relative"><Loader2 className="h-20 w-20 text-primary animate-spin" /><Gavel className="h-8 w-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" /></div>
              <div className="text-center space-y-4 w-full max-w-md">
                <h2 className="text-3xl font-bold">Processing Education Benchmarks...</h2>
                <p className="text-muted-foreground italic text-sm">Reviewing Act 102 & Medicare Proxies.</p>
                <Progress value={progress} className="h-2 rounded-full" />
              </div>
            </motion.div>
          )}
          {step === 'results' && result && (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div><h1 className="text-4xl font-display font-bold">Review Results</h1><p className="text-muted-foreground">Education Assistant Analysis for {result.fileName}</p></div>
                <div className="flex gap-4">
                  <Button variant="outline" className="rounded-2xl border-purple-500 text-purple-600 h-12" onClick={handleLegalExport}><Download className="mr-2 h-4 w-4" /> Export Redacted Review</Button>
                  <Button variant="secondary" size="lg" className="rounded-2xl h-12" onClick={() => setStep('upload')}>New Review</Button>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                   <Card className="bg-primary/5 border-none rounded-[2rem] p-8">
                      <p className="text-xs font-bold text-primary uppercase tracking-widest">Education Amount Review</p>
                      <p className="text-5xl font-bold mt-2 tracking-tighter">${result.totalAmount.toLocaleString()}</p>
                   </Card>
                   <Card className="rounded-3xl p-6">
                    <CardHeader><CardTitle className="flex items-center gap-3"><ClipboardList className="h-6 w-6 text-primary" /> Review Points Detected</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      {result.overcharges.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-muted/50">
                          <div>
                            <p className="text-sm font-bold">{item.description}</p>
                            <p className="text-xs text-muted-foreground italic">Benchmark Basis: ${item.medicareProxyAmount?.toFixed(2)}</p>
                          </div>
                          <Badge variant="destructive" className="rounded-lg">+{item.percentOver}%</Badge>
                        </div>
                      ))}
                    </CardContent>
                   </Card>
                </div>
                <div className="space-y-6">
                  <Card className="rounded-[2rem] border-amber-200 bg-amber-50/30 p-6">
                    <h3 className="text-amber-800 font-bold mb-4 flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Education Points</h3>
                    <div className="space-y-4">
                      {result.reviewPoints.map((point, idx) => (
                        <div key={idx} className="bg-white/60 p-4 rounded-2xl border border-amber-100">
                           <p className="text-xs font-bold uppercase text-amber-900">{point.type.replace('-', ' ')}</p>
                           <p className="text-sm text-amber-800 mt-1">{point.description}</p>
                           <p className="text-[10px] font-bold text-amber-600 mt-2">REMEDY: Check {point.taxonomy?.statute_ref}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                  <div className="bg-blue-600 text-white p-6 rounded-[2rem] shadow-xl">
                    <h3 className="font-bold flex items-center gap-2 mb-2"><Phone className="h-5 w-5" /> Need Official Help?</h3>
                    <p className="text-xs opacity-90 leading-relaxed mb-4">The PA DOI offers official dispute resolution services for "No Surprises Act" issues.</p>
                    <Button variant="secondary" className="w-full font-bold h-11" asChild>
                       <a href={PA_DOI_PORTAL_URL} target="_blank" rel="noreferrer">Open DOI Portal</a>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}