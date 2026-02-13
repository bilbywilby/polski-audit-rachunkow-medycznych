import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileUp, FileText, Loader2, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { extractTextFromPdf, analyzeBillText } from '@/lib/audit-engine';
import { saveAudit, AuditRecord } from '@/lib/db';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
type Step = 'upload' | 'analyzing' | 'results';
export function AuditStudioPage() {
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
      toast.error('Upload failed', { description: 'We could not parse this PDF. Please try pasting the text manually.' });
      setStep('upload');
    }
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false
  });
  return (
    <div className="max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        {step === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold">Audit Studio</h1>
              <p className="text-muted-foreground">Upload your medical bill for a privacy-first audit.</p>
            </div>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors cursor-pointer ${
                isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <FileUp className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-medium">Drag & drop your medical bill PDF here</p>
                  <p className="text-sm text-muted-foreground mt-1">or click to browse from your computer</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or paste text manually</span></div>
            </div>
            <div className="space-y-4">
              <Textarea
                placeholder="Paste the text content of your bill here..."
                className="min-h-[200px]"
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
              />
              <Button 
                className="w-full" 
                disabled={!manualText.trim()}
                onClick={() => processText(manualText, 'Manual Entry')}
              >
                Analyze Pasted Text
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
            className="flex flex-col items-center justify-center py-20 space-y-8"
          >
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <div className="text-center space-y-4 w-full max-w-md">
              <h2 className="text-2xl font-bold">Analyzing your bill...</h2>
              <p className="text-muted-foreground italic text-sm">Everything stays on your device. We are checking for CPT codes, balance billing patterns, and PA legal violations.</p>
              <Progress value={progress} className="h-2" />
            </div>
          </motion.div>
        )}
        {step === 'results' && result && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Audit Results</h1>
              <Button variant="outline" onClick={() => setStep('upload')}>Audit Another</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Analysis Summary</CardTitle>
                  <CardDescription>File: {result.fileName}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground uppercase font-semibold">Total Amount Detected</p>
                      <p className="text-2xl font-bold">${result.totalAmount.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground uppercase font-semibold">Audit Status</p>
                      <Badge variant={result.status === 'clean' ? 'default' : 'destructive'} className="mt-1">
                        {result.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4" /> Detected Codes
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.detectedCpt.map(code => (
                        <Badge key={code} variant="secondary">CPT: {code}</Badge>
                      ))}
                      {result.detectedIcd.map(code => (
                        <Badge key={code} variant="outline">ICD-10: {code}</Badge>
                      ))}
                      {result.detectedCpt.length === 0 && result.detectedIcd.length === 0 && (
                        <span className="text-sm text-muted-foreground">No codes identified.</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
                <CardHeader>
                  <CardTitle className="text-amber-800 dark:text-amber-400 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" /> Warnings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {result.flags.length > 0 ? (
                    result.flags.map((flag, idx) => (
                      <div key={idx} className="text-sm border-l-2 border-amber-500 pl-3 py-1">
                        <p className="font-bold text-amber-900 dark:text-amber-300">{flag.type.replace('-', ' ').toUpperCase()}</p>
                        <p className="text-amber-800/80 dark:text-amber-400/80">{flag.description}</p>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-4 text-center">
                      <CheckCircle2 className="h-8 w-8 text-green-500" />
                      <p className="text-sm font-medium">No obvious violations found in this scan.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold">Generate a Dispute Letter?</h3>
                  <p className="text-primary-foreground/80 text-sm">Use your audit findings to create a professional letter for the provider or insurance company.</p>
                </div>
                <Button asChild variant="secondary" className="whitespace-nowrap">
                  <Link to="/letters">
                    Go to Generator <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}