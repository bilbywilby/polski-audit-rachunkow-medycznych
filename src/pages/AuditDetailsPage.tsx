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
  ClipboardCheck, Info, Eye, EyeOff, ShieldCheck, Landmark, TrendingUp 
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
  if (loading) return <div className="py-20 text-center italic text-muted-foreground">Loading audit...</div>;
  if (!audit) return null;
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="space-y-3">
            <Button variant="ghost" asChild className="mb-2 -ml-4"><Link to="/history"><ArrowLeft className="mr-2 h-4 w-4" /> History</Link></Button>
            <h1 className="text-4xl font-display font-bold">{audit.fileName}</h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <span className="text-sm">{format(new Date(audit.date), 'MMM d, yyyy')}</span>
              <Badge variant={audit.status === 'clean' ? 'secondary' : 'destructive'}>{audit.status.toUpperCase()}</Badge>
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                <ShieldCheck className="h-3 w-3 mr-1" /> Client-Side Verified
              </Badge>
            </div>
          </div>
          <div className="flex gap-3 h-fit">
            <Button variant="outline" className="text-destructive rounded-xl" onClick={() => deleteAudit(audit.id).then(() => navigate('/history'))}>
              <Trash2 className="h-5 w-5" />
            </Button>
            <Button asChild className="rounded-xl shadow-lg shadow-primary/20">
              <Link to="/letters" state={{ audit }}>Dispute Bill <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="rounded-2xl border-none bg-muted/30">
            <CardContent className="pt-6">
              <p className="text-xs font-bold text-muted-foreground uppercase">Provider</p>
              <p className="text-lg font-bold truncate">{audit.extractedData.providerName || 'Not Detected'}</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-none bg-muted/30">
            <CardContent className="pt-6">
              <p className="text-xs font-bold text-muted-foreground uppercase">Date of Service</p>
              <p className="text-lg font-bold">{audit.extractedData.dateOfService || 'Not Detected'}</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-none bg-muted/30">
            <CardContent className="pt-6">
              <p className="text-xs font-bold text-muted-foreground uppercase">Policy/ID</p>
              <p className="text-lg font-bold">{audit.extractedData.policyId || 'Not Detected'}</p>
            </CardContent>
          </Card>
        </div>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-muted p-1 rounded-xl">
            <TabsTrigger value="overview" className="rounded-lg">Findings</TabsTrigger>
            <TabsTrigger value="benchmarks" className="rounded-lg">Cost Analysis</TabsTrigger>
            <TabsTrigger value="raw" className="rounded-lg">Text Inspector</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card className="rounded-2xl">
                  <CardHeader><CardTitle className="flex items-center gap-2"><ClipboardCheck className="h-5 w-5 text-primary" /> Medical Codes</CardTitle></CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <p className="text-xs font-bold uppercase text-muted-foreground">CPT (Procedures)</p>
                        <div className="flex flex-wrap gap-2">
                          {audit.detectedCpt.map(c => <Badge key={c} className="bg-blue-100 text-blue-800 hover:bg-blue-100">{c}</Badge>)}
                          {audit.detectedCpt.length === 0 && <span className="text-sm italic">None</span>}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-bold uppercase text-muted-foreground">ICD-10 (Diagnoses)</p>
                        <div className="flex flex-wrap gap-2">
                          {audit.detectedIcd.map(c => <Badge key={c} variant="outline" className="border-indigo-200">{c}</Badge>)}
                          {audit.detectedIcd.length === 0 && <span className="text-sm italic">None</span>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <div className="p-6 bg-primary/5 border border-primary/10 rounded-2xl flex justify-between items-center">
                  <div><p className="text-sm font-medium text-muted-foreground">Total Detected Amount</p><p className="text-3xl font-bold">${audit.totalAmount.toLocaleString()}</p></div>
                  <Info className="h-8 w-8 text-primary/40" />
                </div>
              </div>
              <div className="space-y-6">
                <Card className="bg-amber-50 border-amber-200 rounded-2xl">
                  <CardHeader><CardTitle className="text-amber-800 flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Audit Flags</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {audit.flags.length > 0 ? audit.flags.map((f, i) => (
                      <div key={i} className="p-3 bg-white/60 border border-amber-200 rounded-xl">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-xs font-bold uppercase text-amber-900">{f.type.replace('-', ' ')}</p>
                          <Badge className="scale-75 origin-right">{f.severity}</Badge>
                        </div>
                        <p className="text-xs text-amber-800">{f.description}</p>
                      </div>
                    )) : (
                      <p className="text-sm text-center italic text-muted-foreground">No critical flags detected.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="benchmarks">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /> PA Cost Benchmarking</CardTitle>
                <CardDescription>Comparison against average Pennsylvania reimbursement rates.</CardDescription>
              </CardHeader>
              <CardContent>
                {audit.overcharges.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-muted-foreground">
                          <th className="text-left pb-3 font-medium">Code</th>
                          <th className="text-left pb-3 font-medium">Description</th>
                          <th className="text-right pb-3 font-medium">Your Bill</th>
                          <th className="text-right pb-3 font-medium">PA Average</th>
                          <th className="text-right pb-3 font-medium">Markup</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {audit.overcharges.map((item, idx) => (
                          <tr key={idx} className="group">
                            <td className="py-4 font-mono font-bold text-primary">{item.code}</td>
                            <td className="py-4 text-muted-foreground">{item.description}</td>
                            <td className="py-4 text-right font-bold">${item.billedAmount.toLocaleString()}</td>
                            <td className="py-4 text-right">${item.benchmarkAmount.toLocaleString()}</td>
                            <td className="py-4 text-right">
                              <Badge className={item.percentOver > 25 ? 'bg-red-500' : 'bg-amber-500'}>
                                +{item.percentOver}%
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <Landmark className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                    <p className="text-muted-foreground">No significant price anomalies detected based on identified codes.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="raw">
            <Card className="rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <div><CardTitle>Document Text</CardTitle><CardDescription>Privacy-first redacted view by default.</CardDescription></div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="pii-toggle" className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                    {showPII ? <Eye className="h-3 w-3 text-red-500" /> : <EyeOff className="h-3 w-3" />}
                    Reveal PII
                  </Label>
                  <Switch id="pii-toggle" checked={showPII} onCheckedChange={togglePII} />
                </div>
              </CardHeader>
              <CardContent>
                <pre className="p-4 bg-muted/30 rounded-lg text-xs font-mono whitespace-pre-wrap max-h-[500px] overflow-y-auto">
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