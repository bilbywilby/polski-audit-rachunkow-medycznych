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
  ClipboardCheck, Info, Eye, EyeOff, ShieldCheck, Landmark, TrendingUp, Lock
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
      if (confirm('Warning: Enabling PII will show unredacted sensitive information. Are you sure?')) {
        setShowPII(true);
      }
    } else {
      setShowPII(false);
    }
  };
  const handleDeleteRecord = async () => {
    if (!audit) return;
    if (confirm('Permanently delete this audit record?')) {
      await deleteAudit(audit.id);
      toast.success('Audit deleted');
      navigate('/history');
    }
  };
  if (loading) return <div className="py-20 text-center italic text-muted-foreground">Loading audit...</div>;
  if (!audit) return null;
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="space-y-3">
            <Button variant="ghost" asChild className="mb-2 -ml-4 hover:bg-transparent px-0">
              <Link to="/history" className="flex items-center text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to History
              </Link>
            </Button>
            <h1 className="text-4xl font-display font-bold tracking-tight">{audit.fileName}</h1>
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              <span className="text-sm font-medium bg-muted px-2.5 py-0.5 rounded-full">
                {format(new Date(audit.date), 'MMMM d, yyyy')}
              </span>
              <Badge variant={audit.status === 'clean' ? 'secondary' : 'destructive'} className="uppercase">
                {audit.status}
              </Badge>
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Secure Local Processing
              </Badge>
            </div>
          </div>
          <div className="flex gap-3 h-fit">
            <Button variant="outline" className="text-destructive hover:bg-destructive/10 rounded-xl px-4" onClick={handleDeleteRecord}>
              <Trash2 className="h-5 w-5" />
            </Button>
            <Button asChild className="rounded-xl shadow-lg shadow-primary/20 px-6">
              <Link to="/letters" state={{ audit }}>Generate Dispute <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="rounded-2xl border-none bg-muted/30 shadow-none">
            <CardContent className="pt-6">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Provider</p>
              <p className="text-lg font-bold truncate text-foreground">{audit.extractedData.providerName || 'Not Detected'}</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-none bg-muted/30 shadow-none">
            <CardContent className="pt-6">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Service Date</p>
              <p className="text-lg font-bold text-foreground">{audit.extractedData.dateOfService || 'Not Detected'}</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-none bg-muted/30 shadow-none">
            <CardContent className="pt-6">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Policy/Member ID</p>
              <p className="text-lg font-bold text-foreground truncate">{audit.extractedData.policyId || 'Not Detected'}</p>
            </CardContent>
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
                      Medical Coding Inventory
                    </CardTitle>
                    <CardDescription>All recognized billing identifiers detected in the document.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <p className="text-xs font-bold uppercase text-muted-foreground tracking-widest">CPT (Procedures)</p>
                        <div className="flex flex-wrap gap-2">
                          {audit.detectedCpt.map(c => <Badge key={c} className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-none">{c}</Badge>)}
                          {audit.detectedCpt.length === 0 && <span className="text-sm italic text-muted-foreground">No procedure codes detected</span>}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <p className="text-xs font-bold uppercase text-muted-foreground tracking-widest">ICD-10 (Diagnoses)</p>
                        <div className="flex flex-wrap gap-2">
                          {audit.detectedIcd.map(c => <Badge key={c} variant="outline" className="border-indigo-200 text-indigo-700">{c}</Badge>)}
                          {audit.detectedIcd.length === 0 && <span className="text-sm italic text-muted-foreground">No diagnostic codes detected</span>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <div className="p-8 bg-primary text-primary-foreground rounded-2xl flex justify-between items-center shadow-lg shadow-primary/10">
                  <div className="space-y-1">
                    <p className="text-sm font-medium opacity-80 uppercase tracking-widest">Calculated Total</p>
                    <p className="text-4xl font-bold">${audit.totalAmount.toLocaleString()}</p>
                  </div>
                  <Info className="h-10 w-10 opacity-20" />
                </div>
              </div>
              <div className="space-y-6">
                <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900 rounded-2xl border-2 shadow-sm overflow-hidden">
                  <CardHeader className="bg-amber-100/50 dark:bg-amber-900/40">
                    <CardTitle className="text-amber-900 dark:text-amber-400 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" /> Audit Flags
                    </CardTitle>
                    <CardDescription className="text-amber-800/70 dark:text-amber-400/70">
                      Heuristic checks against billing patterns.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    {audit.flags.length > 0 ? audit.flags.map((f, i) => (
                      <div key={i} className="p-4 bg-white/80 dark:bg-black/40 border border-amber-200/50 rounded-xl space-y-2">
                        <div className="flex justify-between items-start">
                          <p className="text-xs font-bold uppercase text-amber-900 dark:text-amber-200">{f.type.replace('-', ' ')}</p>
                          <Badge className={`text-[10px] h-5 ${f.severity === 'high' ? 'bg-red-500' : 'bg-amber-500'}`}>{f.severity}</Badge>
                        </div>
                        <p className="text-sm text-amber-800/90 dark:text-amber-300/90 leading-snug">{f.description}</p>
                      </div>
                    )) : (
                      <div className="text-center py-6 space-y-2">
                        <ShieldCheck className="h-10 w-10 text-green-500 mx-auto" />
                        <p className="text-sm font-bold text-green-700">Audit Passed</p>
                        <p className="text-xs text-green-600">No red flags identified automatically.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="benchmarks" className="outline-none">
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" /> 
                  PA Regional Benchmark Check
                </CardTitle>
                <CardDescription>Comparing identified codes against average 2024 reimbursement rates for Pennsylvania.</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                {audit.overcharges.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b text-muted-foreground text-xs uppercase tracking-widest font-bold">
                          <th className="text-left py-4 px-2">CPT Code</th>
                          <th className="text-left py-4 px-2">Service Description</th>
                          <th className="text-right py-4 px-2">Billed</th>
                          <th className="text-right py-4 px-2">PA Avg.</th>
                          <th className="text-right py-4 px-2">Markup</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-sm">
                        {audit.overcharges.map((item, idx) => (
                          <tr key={idx} className="group hover:bg-muted/30 transition-colors">
                            <td className="py-5 px-2 font-mono font-bold text-primary">{item.code}</td>
                            <td className="py-5 px-2 text-muted-foreground">{item.description}</td>
                            <td className="py-5 px-2 text-right font-bold text-foreground">${item.billedAmount.toLocaleString()}</td>
                            <td className="py-5 px-2 text-right text-muted-foreground">${item.benchmarkAmount.toLocaleString()}</td>
                            <td className="py-5 px-2 text-right">
                              <Badge className={`rounded-md ${item.percentOver > 35 ? 'bg-red-500' : 'bg-amber-500'}`}>
                                +{item.percentOver}%
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-16 text-center bg-muted/20 rounded-xl border-2 border-dashed border-muted">
                    <Landmark className="h-14 w-14 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-lg font-bold mb-1">No Pricing Anomalies</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto text-sm">
                      We didn't detect any codes that significantly deviate from Pennsylvania cost benchmarks in our knowledge base.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="raw" className="outline-none">
            <Card className="rounded-2xl shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/30 flex flex-row items-center justify-between py-6">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" /> Document Inspector
                  </CardTitle>
                  <CardDescription>Verify raw extraction results. All data remains in browser memory.</CardDescription>
                </div>
                <div className="flex items-center space-x-3 bg-white dark:bg-black p-2 rounded-lg border shadow-sm">
                  <Label htmlFor="pii-toggle-details" className="flex items-center gap-2 text-xs font-bold cursor-pointer select-none px-1">
                    {showPII ? <Eye className="h-4 w-4 text-red-500" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                    <span className={showPII ? "text-red-500" : "text-muted-foreground"}>REVEAL PII</span>
                  </Label>
                  <Switch id="pii-toggle-details" checked={showPII} onCheckedChange={togglePII} />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative group">
                  <pre className="p-6 md:p-10 font-mono text-[11px] leading-relaxed whitespace-pre-wrap max-h-[600px] overflow-y-auto bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300">
                    {showPII ? audit.rawText : audit.redactedText}
                  </pre>
                  {!showPII && (
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-600 rounded-full border border-green-500/20 text-[10px] font-bold uppercase tracking-wider">
                      <Lock className="h-3 w-3" /> Auto-Redacted Mode
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}