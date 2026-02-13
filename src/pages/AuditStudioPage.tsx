import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileUp, FileText, Loader2, CheckCircle2, AlertTriangle, ArrowRight, Activity, ClipboardList, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { extractTextFromPdf, analyzeBillText } from '@/lib/audit-engine';
import { saveAudit, AuditRecord } from '@/lib/db';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';
type Step = 'upload' | 'analyzing' | 'results';
export function AuditStudioPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('upload');
  const [progress, setProgress] = useState(0);
  const [manualText, setManualText] = useState('');
  const [result, setResult] = useState<AuditRecord | null>(null);
  const processText = async (text: string, name: string) => {
    setStep('analyzing');
    setProgress(20);
    try {
      const analysis = await analyzeBillText(text, name);
      setProgress(60);
      await saveAudit(analysis);
      setProgress(100);
      setResult(analysis);
      setStep('results');
    } catch (error) {
      console.error(error);
      toast.error('Audit failed', { description: 'Could not analyze the provided text.' });
      setStep('upload');
    }
  };
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setStep('analyzing');
    setProgress(10);
    try {
      const text = await extractTextFromPdf(file);
      await processText(text, file.name);
    } catch (error) {
      console.error(error);
      toast.error('Upload failed', { description: 'We could not parse this PDF. Please try pasting the text manually.' });
      setStep('upload');
    }
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false
  });
  const goToGenerator = () => {
    if (result) {
      navigate('/letters', { state: { audit: result } });
    }
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
              <div className="text-center space-y-2">
                <h1 className="text-4xl font-display font-bold">Audit Studio</h1>
                <p className="text-muted-foreground text-lg">Upload your medical bill for a privacy-first audit. We find the errors hospitals hope you miss.</p>
              </div>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-3xl p-16 text-center transition-all cursor-pointer shadow-sm ${
                  isDragActive ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-border hover:border-primary/50 hover:bg-muted/30'
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-6">
                  <div className="p-5 bg-primary/10 rounded-2xl">
                    <FileUp className="h-10 w-10 text-primary" />
                  </div>
                  <div>
                    <p className="text-xl font-semibold">Drag & drop your medical bill PDF</p>
                    <p className="text-muted-foreground mt-2">Maximum file size: 10MB. Confidential processing.</p>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-4 text-muted-foreground font-medium">Or paste text content</span></div>
              </div>
              <div className="space-y-4">
                <Textarea
                  placeholder="Paste the text from your bill here if you don't have a PDF..."
                  className="min-h-[200px] rounded-2xl border-muted bg-muted/20"
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                />
                <Button
                  className="w-full h-12 text-lg font-semibold rounded-xl"
                  disabled={!manualText.trim()}
                  onClick={() => processText(manualText, 'Manual Entry')}
                >
                  Analyze Text Data
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
              className="flex flex-col items-center justify-center py-24 space-y-8"
            >
              <div className="relative">
                <Loader2 className="h-16 w-16 text-primary animate-spin" />
                <Activity className="h-6 w-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="text-center space-y-4 w-full max-w-md">
                <h2 className="text-3xl font-bold">Auditing Records...</h2>
                <p className="text-muted-foreground italic">Your data is safe. We are scanning for CPT, HCPCS, and Revenue codes along with PA-specific protections.</p>
                <Progress value={progress} className="h-2" />
              </div>
            </motion.div>
          )}
          {step === 'results' && result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-4xl font-display font-bold">Audit Findings</h1>
                  <p className="text-muted-foreground">Results for: {result.fileName}</p>
                </div>
                <Button variant="outline" size="lg" className="rounded-xl" onClick={() => setStep('upload')}>Audit New Bill</Button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card className="bg-primary/5 border-none shadow-none">
                      <CardContent className="pt-6">
                        <p className="text-sm font-semibold text-primary uppercase tracking-wider">Total Billed</p>
                        <p className="text-4xl font-bold mt-1">${result.totalAmount.toLocaleString()}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/50 border-none shadow-none">
                      <CardContent className="pt-6">
                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Risk Level</p>
                        <Badge variant={result.status === 'clean' ? 'default' : 'destructive'} className="mt-2 h-7 px-4 text-sm">
                          {result.status.toUpperCase()}
                        </Badge>
                      </CardContent>
                    </Card>
                  </div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5 text-primary" />
                        Medical Codes Detected
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <TooltipProvider>
                        <div className="space-y-4">
                          <div className="space-y-3">
                            <p className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                              Procedures (CPT)
                              <Tooltip><TooltipTrigger><Info className="h-3 w-3" /></TooltipTrigger><TooltipContent>Standard codes for services and procedures.</TooltipContent></Tooltip>
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {result.detectedCpt.map(code => <Badge key={code} variant="secondary" className="bg-blue-100 text-blue-700">{code}</Badge>)}
                              {result.detectedCpt.length === 0 && <span className="text-sm italic">None</span>}
                            </div>
                          </div>
                          {(result.detectedHcpcs?.length ?? 0) > 0 && (
                            <div className="space-y-3">
                              <p className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                                Supplies (HCPCS)
                                <Tooltip><TooltipTrigger><Info className="h-3 w-3" /></TooltipTrigger><TooltipContent>Codes for medical equipment, supplies, and medications.</TooltipContent></Tooltip>
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {result.detectedHcpcs?.map(code => <Badge key={code} variant="secondary" className="bg-indigo-100 text-indigo-700">{code}</Badge>)}
                              </div>
                            </div>
                          )}
                          {(result.detectedRevenue?.length ?? 0) > 0 && (
                            <div className="space-y-3">
                              <p className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                                Revenue Codes
                                <Tooltip><TooltipTrigger><Info className="h-3 w-3" /></TooltipTrigger><TooltipContent>Identifies the hospital department where service was provided.</TooltipContent></Tooltip>
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {result.detectedRevenue?.map(code => <Badge key={code} variant="secondary" className="bg-orange-100 text-orange-700">{code}</Badge>)}
                              </div>
                            </div>
                          )}
                        </div>
                      </TooltipProvider>
                    </CardContent>
                  </Card>
                </div>
                <div className="space-y-6">
                  <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900 border-2">
                    <CardHeader>
                      <CardTitle className="text-amber-800 dark:text-amber-400 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" /> Detected Issues
                      </CardTitle>
                      <CardDescription className="text-amber-700/70 dark:text-amber-400/60">
                        {result.flags.length} potential violations found.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {result.flags.length > 0 ? (
                        result.flags.map((flag, idx) => (
                          <div key={idx} className="bg-white/50 dark:bg-black/20 p-4 rounded-xl border border-amber-200/50">
                            <div className="flex justify-between items-start mb-1">
                              <p className="font-bold text-amber-900 dark:text-amber-300 text-sm">
                                {flag.type.replace('-', ' ').toUpperCase()}
                              </p>
                              <Badge className={flag.severity === 'high' ? 'bg-red-500' : 'bg-amber-500'}>
                                {flag.severity}
                              </Badge>
                            </div>
                            <p className="text-amber-800/90 dark:text-amber-400/90 text-sm leading-relaxed">
                              {flag.description}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6">
                          <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-2" />
                          <p className="font-bold text-green-700">Audit Passed</p>
                          <p className="text-sm text-green-600">No major red flags found.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  <Card className="bg-primary text-primary-foreground shadow-lg shadow-primary/20 rounded-2xl overflow-hidden border-none">
                    <CardContent className="p-8 space-y-6">
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold">Dispute this bill?</h3>
                        <p className="text-primary-foreground/80 leading-relaxed">
                          We can generate a professional dispute letter using your audit findings.
                        </p>
                      </div>
                      <Button onClick={goToGenerator} variant="secondary" className="w-full h-12 text-lg font-bold rounded-xl shadow-sm">
                        Generate Letter <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
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