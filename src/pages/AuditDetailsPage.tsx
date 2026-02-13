import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getAuditById, AuditRecord, deleteAudit } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft, AlertTriangle, FileText, Trash2, ArrowRight,
  ClipboardCheck, Eye, EyeOff, ShieldCheck, Landmark, TrendingUp, Lock, Copy
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
export function AuditDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [audit, setAudit] = useState<AuditRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPII, setShowPII] = useState(false);
  useEffect(() => {
    async function fetchAudit() {
      if (!id) return;
      try {
        const record = await getAuditById(id);
        if (record) setAudit(record);
        else navigate('/history');
      } catch (e) {
        toast.error('Error loading audit');
      } finally {
        setLoading(false);
      }
    }
    fetchAudit();
  }, [id, navigate]);
  const togglePII = (checked: boolean) => {
    if (checked) {
      if (confirm('Warning: This will reveal personal details (Policy IDs, Account #s). Continue?')) {
        setShowPII(true);
      }
    } else {
      setShowPII(false);
    }
  };
  const handleCopySummary = () => {
    if (!audit) return;
    const summary = `Audit Summary: ${audit.fileName}\nProvider: ${audit.extractedData.providerName}\nDate: ${audit.extractedData.dateOfService}\nTotal: $${audit.totalAmount}\nFlags: ${audit.flags.length}`;
    navigator.clipboard.writeText(summary);
    toast.success('Summary copied to clipboard');
  };
  if (loading) return <div className="py-20 text-center italic text-muted-foreground">Loading audit...</div>;
  if (!audit) return null;
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="space-y-3">
            <Button variant="ghost" asChild className="mb-2 -ml-4 hover:bg-transparent px-0">
              <Link to="/history" className="flex items-center text-muted-foreground hover:text-primary">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to History
              </Link>
            </Button>
            <h1 className="text-4xl font-display font-bold tracking-tight">{audit.fileName}</h1>
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              <Badge variant="outline" className="text-xs font-bold border-primary/20 bg-primary/5">
                Processed: {format(new Date(audit.date), 'MMM d, yyyy')}
              </Badge>
              <Badge variant={audit.status === 'clean' ? 'secondary' : 'destructive'}>
                {audit.status.toUpperCase()}
              </Badge>
              <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
                <ShieldCheck className="h-3 w-3" /> Secure Locally
              </div>
            </div>
          </div>
          <div className="flex gap-3 h-fit">
            <Button variant="outline" onClick={handleCopySummary} className="rounded-xl px-4">
              <Copy className="h-5 w-5" />
            </Button>
            <Button asChild className="rounded-xl shadow-lg shadow-primary/20 px-6">
              <Link to="/letters" state={{ audit }}>Dispute Bill <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="rounded-2xl border-none bg-muted/30 shadow-none p-6">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Provider</p>
            <p className="font-bold text-foreground line-clamp-1">{audit.extractedData.providerName}</p>
          </Card>
          <Card className="rounded-2xl border-none bg-muted/30 shadow-none p-6">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Service Date</p>
            <p className="font-bold text-foreground">{audit.extractedData.dateOfService || 'N/A'}</p>
          </Card>
          <Card className="rounded-2xl border-none bg-muted/30 shadow-none p-6">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Account #</p>
            <p className="font-bold text-foreground">{showPII ? (audit.extractedData.accountNumber || 'N/A') : '[REDACTED]'}</p>
          </Card>
          <Card className="rounded-2xl border-none bg-muted/30 shadow-none p-6">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Policy ID</p>
            <p className="font-bold text-foreground">{showPII ? (audit.extractedData.policyId || 'N/A') : '[REDACTED]'}</p>
          </Card>
        </div>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-muted p-1 rounded-xl">
            <TabsTrigger value="overview" className="rounded-lg px-6">Findings</TabsTrigger>
            <TabsTrigger value="benchmarks" className="rounded-lg px-6">Cost Analysis</TabsTrigger>
            <TabsTrigger value="raw" className="rounded-lg px-6">Inspector</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-8 outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card className="rounded-2xl shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <ClipboardCheck className="h-5 w-5 text-primary" />
                      Smart Extraction
                    </CardTitle>
                    <CardDescription>Verified billing codes and identifiers.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <p className="text-xs font-bold uppercase text-muted-foreground tracking-widest">CPT (Procedures)</p>
                        <div className="flex flex-wrap gap-2">
                          {audit.detectedCpt.map(c => <Badge key={c} className="bg-blue-100 text-blue-800 border-none">{c}</Badge>)}
                          {audit.detectedCpt.length === 0 && <span className="text-sm italic text-muted-foreground">None</span>}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <p className="text-xs font-bold uppercase text-muted-foreground tracking-widest">ICD-10 (Diagnosis)</p>
                        <div className="flex flex-wrap gap-2">
                          {audit.detectedIcd.map(c => <Badge key={c} variant="outline" className="border-indigo-200 text-indigo-700">{c}</Badge>)}
                          {audit.detectedIcd.length === 0 && <span className="text-sm italic text-muted-foreground">None</span>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <div className="p-8 bg-primary text-primary-foreground rounded-2xl flex justify-between items-center shadow-lg shadow-primary/10">
                  <div className="space-y-1">
                    <p className="text-sm font-medium opacity-80 uppercase tracking-widest">Billed Total</p>
                    <p className="text-4xl font-bold">${audit.totalAmount.toLocaleString()}</p>
                  </div>
                  <Lock className="h-10 w-10 opacity-20" />
                </div>
              </div>
              <div className="space-y-6">
                <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900 rounded-2xl border-2">
                  <CardHeader>
                    <CardTitle className="text-amber-900 dark:text-amber-400 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" /> Audit Flags
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    {audit.flags.length > 0 ? audit.flags.map((f, i) => (
                      <div key={i} className="p-4 bg-white/80 dark:bg-black/40 border border-amber-200/50 rounded-xl space-y-1">
                        <div className="flex justify-between items-start">
                          <p className="text-xs font-bold uppercase text-amber-900">{f.type.replace('-', ' ')}</p>
                          <Badge className={`text-[10px] h-5 ${f.severity === 'high' ? 'bg-red-500' : 'bg-amber-500'}`}>{f.severity}</Badge>
                        </div>
                        <p className="text-sm text-amber-800 leading-snug">{f.description}</p>
                      </div>
                    )) : (
                      <div className="text-center py-6">
                        <ShieldCheck className="h-10 w-10 text-green-500 mx-auto mb-2" />
                        <p className="text-sm font-bold text-green-700">Audit Passed</p>
                        <p className="text-xs text-green-600">No red flags found.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="benchmarks" className="outline-none">
            <Card className="rounded-2xl shadow-sm overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  PA Regional Benchmarks
                </CardTitle>
                <CardDescription>Comparison against 2024-2025 Pennsylvania averages.</CardDescription>
              </CardHeader>
              <CardContent>
                {audit.overcharges.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b text-muted-foreground text-xs uppercase tracking-widest font-bold">
                          <th className="text-left py-4 px-2">Code</th>
                          <th className="text-left py-4 px-2">Service</th>
                          <th className="text-right py-4 px-2">Billed</th>
                          <th className="text-right py-4 px-2">PA Avg.</th>
                          <th className="text-right py-4 px-2">Diff.</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-sm">
                        {audit.overcharges.map((item, idx) => (
                          <tr key={idx} className="hover:bg-muted/30">
                            <td className="py-5 px-2 font-mono font-bold">{item.code}</td>
                            <td className="py-5 px-2 text-muted-foreground">{item.description}</td>
                            <td className="py-5 px-2 text-right font-bold">${item.billedAmount.toLocaleString()}</td>
                            <td className="py-5 px-2 text-right text-muted-foreground">${item.benchmarkAmount.toLocaleString()}</td>
                            <td className="py-5 px-2 text-right font-bold text-red-500">+{item.percentOver}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-20 text-center text-muted-foreground">
                    <Landmark className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    No pricing anomalies found for detected codes.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="raw" className="outline-none">
            <Card className="rounded-2xl shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/30 flex flex-row items-center justify-between py-6">
                <div>
                  <CardTitle className="text-lg">Document Inspector</CardTitle>
                  <CardDescription>Review raw extraction with privacy controls.</CardDescription>
                </div>
                <div className="flex items-center space-x-3 bg-white dark:bg-black p-2 rounded-lg border">
                  <Label htmlFor="pii-toggle" className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                    {showPII ? <Eye className="h-4 w-4 text-red-500" /> : <EyeOff className="h-4 w-4" />}
                    REVEAL PII
                  </Label>
                  <Switch id="pii-toggle" checked={showPII} onCheckedChange={togglePII} />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <pre className="p-8 font-mono text-[11px] leading-relaxed whitespace-pre-wrap max-h-[600px] overflow-y-auto bg-slate-50 dark:bg-slate-950">
                  {showPII ? audit.rawText : audit.redactedText}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}