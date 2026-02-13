import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  FileUp,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Activity,
  ClipboardList,
  Info,
  ShieldCheck,
  Fingerprint,
  Gavel,
  Download,
  Lock,
  Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { extractTextFromPdf, analyzeBillText, generateDocumentFingerprint, exportLegalAuditPackage } from '@/lib/audit-engine';
import { saveAudit, AuditRecord, findAuditByFingerprint } from '@/lib/db';
import { MAX_FILE_SIZE, PA_DOH_HOTLINE, ACT_102_REFERENCES } from '@/data/constants';
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
          description: 'This document has already been audited.',
          action: {
            label: 'View Existing',
            onClick: () => navigate(`/audit/${existing.id}`)
          }
        });
      }
      setProgress(30);
      const analysis = await analyzeBillText(text, name);
      setProgress(70);
      await saveAudit(analysis);
      setProgress(100);
      setResult(analysis);
      setStep('results');
    } catch (error) {
      console.error(error);
      toast.error('Audit failed', {
        description: error instanceof Error ? error.message : 'Could not analyze the provided text.'
      });
      setStep('upload');
    }
  }, [navigate]);
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File too large', { description: 'Medical bills must be under 10MB.' });
      return;
    }
    setStep('analyzing');
    setProgress(10);
    try {
      const text = await extractTextFromPdf(file);
      await processText(text, file.name);
    } catch (error) {
      console.error(error);
      toast.error('Upload failed', {
        description: 'We could not parse this PDF. Please try pasting the text manually.'
      });
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
    a.download = `Legal_Audit_Package_${result.id.substring(0, 8)}.json`;
    a.click();
    toast.success('Legal Audit Package Exported');
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12">
        <AnimatePresence mode="wait">
          {step === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-3xl p-8 text-white shadow-2xl border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Lock className="h-32 w-32 -mr-10 -mt-10" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                  <div className="h-16 w-16 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center border border-white/20">
                    <ShieldCheck className="h-8 w-8 text-blue-400" />
                  </div>
                  <div className="flex-1 space-y-1 text-center md:text-left">
                    <h3 className="text-xl font-bold tracking-tight uppercase">HIPAA-Compliant Sandbox Active</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Your medical data never leaves this browser. Local processing verifies <strong>PA Act 102</strong> & <strong>No Surprises Act</strong> compliance.
                    </p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                    <Phone className="h-5 w-5 text-indigo-400" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">PA DOH Hotline</p>
                      <p className="text-sm font-mono font-bold">{PA_DOH_HOTLINE}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center space-y-2">
                <h1 className="text-5xl font-display font-bold">Audit Studio</h1>
                <p className="text-muted-foreground text-lg">Statutory precision for Pennsylvania healthcare billing.</p>
              </div>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-[2.5rem] p-20 text-center transition-all cursor-pointer shadow-sm ${
                  isDragActive ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-border hover:border-primary/50 hover:bg-muted/30'
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-6">
                  <div className="p-6 bg-primary/10 rounded-3xl">
                    <FileUp className="h-12 w-12 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold">Drop your bill PDF here</p>
                    <p className="text-muted-foreground">Local encryption ensures 100% privacy.</p>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-4 text-muted-foreground font-bold tracking-widest">Manual Entry Mode</span></div>
              </div>
              <div className="space-y-4">
                <Textarea
                  placeholder="Paste billing text for statutory audit..."
                  className="min-h-[200px] rounded-3xl border-muted bg-muted/20 p-6"
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                />
                <Button
                  className="w-full h-14 text-xl font-bold rounded-2xl shadow-xl shadow-primary/20"
                  disabled={!manualText.trim()}
                  onClick={() => processText(manualText, 'Manual Entry')}
                >
                  Analyze Compliance Data
                </Button>
              </div>
            </motion.div>
          )}
          {step === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 space-y-8"
            >
              <div className="relative">
                <Loader2 className="h-20 w-20 text-primary animate-spin" />
                <Gavel className="h-8 w-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="text-center space-y-4 w-full max-w-md">
                <h2 className="text-3xl font-bold">Auditing Statutes...</h2>
                <p className="text-muted-foreground italic text-sm">Validating Medicare Proxy (0.72) and Act 102 Sections.</p>
                <Progress value={progress} className="h-2 rounded-full" />
              </div>
            </motion.div>
          )}
          {step === 'results' && result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-10"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h1 className="text-4xl font-display font-bold">Audit Results</h1>
                  <p className="text-muted-foreground">Certified statutory review for {result.fileName}</p>
                </div>
                <div className="flex gap-4">
                  <Button 
                    variant="outline" 
                    className={`rounded-2xl border-purple-500 text-purple-600 hover:bg-purple-50 h-12 ${result.flags.some(f => f.isSevere) ? 'animate-pulse ring-2 ring-purple-200' : ''}`}
                    onClick={handleLegalExport}
                  >
                    <Download className="mr-2 h-4 w-4" /> Legal Audit Package
                  </Button>
                  <Button variant="secondary" size="lg" className="rounded-2xl h-12" onClick={() => setStep('upload')}>Audit New Bill</Button>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Card className="bg-primary/5 border-none shadow-none rounded-[2rem]">
                      <CardContent className="pt-8">
                        <p className="text-xs font-bold text-primary uppercase tracking-widest">Total Amount Billed</p>
                        <p className="text-5xl font-bold mt-2 tracking-tighter">${result.totalAmount.toLocaleString()}</p>
                      </CardContent>
                    </Card>
                    {result.fapEligible && (
                      <Card className="bg-green-500 text-white border-none shadow-xl shadow-green-500/20 rounded-[2rem]">
                        <CardContent className="pt-8">
                          <p className="text-xs font-bold uppercase tracking-widest opacity-80">FAP ELIGIBILITY DETECTED</p>
                          <p className="text-2xl font-bold mt-2">Hospital waiver recommended.</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                  <Card className="rounded-3xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <ClipboardList className="h-6 w-6 text-primary" /> Code Extraction & Citations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        {result.overcharges.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-muted/50">
                            <div>
                              <p className="text-sm font-bold">{item.code} - {item.description}</p>
                              <p className="text-xs text-muted-foreground">Medicare Proxy: ${item.medicareProxyAmount?.toFixed(2)}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant="destructive" className="rounded-lg">+{item.percentOver}%</Badge>
                              {item.legalCitation && (
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-600 hover:bg-indigo-50 rounded-full">
                                      <Gavel className="h-4 w-4" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-80 rounded-2xl p-4 space-y-2">
                                    <p className="font-bold text-sm text-indigo-700">{item.legalCitation}</p>
                                    <p className="text-xs text-muted-foreground">{item.statutoryReference}</p>
                                    <div className="pt-2 border-t mt-2">
                                      <p className="text-[10px] font-bold uppercase text-slate-400">Remediation</p>
                                      <p className="text-xs font-medium">Request itemization & cite Section 5 in dispute.</p>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              )}
                            </div>
                          </div>
                        ))}
                        {result.overcharges.length === 0 && (
                          <div className="text-center py-6 italic text-muted-foreground">No severe cost anomalies detected.</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="space-y-6">
                  <Card className="bg-slate-900 text-white rounded-[2rem] border-none p-2 shadow-2xl overflow-hidden">
                    <div className="p-6 space-y-6">
                      <div className="space-y-2">
                        <Badge className="bg-indigo-500 hover:bg-indigo-600">PA ACT 102</Badge>
                        <h3 className="text-2xl font-bold">Legal Audit Package</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                          Your audit package is ready for download. This includes cryptographically signed findings for legal review or PA DOH submission.
                        </p>
                      </div>
                      <Button onClick={handleLegalExport} variant="secondary" className="w-full h-12 font-bold rounded-xl shadow-lg">
                        <Download className="mr-2 h-4 w-4" /> Export Package
                      </Button>
                    </div>
                  </Card>
                  <Card className="rounded-[2rem] border-amber-200 bg-amber-50/30">
                    <CardHeader>
                      <CardTitle className="text-amber-800 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" /> Statutory Risks
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {result.flags.map((flag, idx) => (
                        <div key={idx} className="bg-white/60 p-4 rounded-2xl border border-amber-100 space-y-2">
                          <div className="flex justify-between items-center">
                            <p className="text-xs font-bold uppercase text-amber-900">{flag.type.replace('-', ' ')}</p>
                            <Badge className={flag.severity === 'high' ? 'bg-red-500' : 'bg-amber-500'}>{flag.severity}</Badge>
                          </div>
                          <p className="text-sm text-amber-800">{flag.description}</p>
                          <p className="text-[10px] font-bold text-amber-600 opacity-70">REMEDY: Refer to {flag.taxonomy?.statute_ref}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}