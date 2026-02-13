import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAuditById, AuditRecord } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowLeft, AlertTriangle, Lock, ShieldCheck, ClipboardList, Gavel, Download, Fingerprint, Activity, Info } from 'lucide-react';
import { format } from 'date-fns';
import { exportLegalAuditPackage } from '@/lib/audit-engine';
import { toast } from 'sonner';
import { BENCHMARK_DISCLAIMER, PA_DOI_DISCLAIMER } from '@/data/constants';
export function AuditDetailsPage() {
  const { id } = useParams();
  const [audit, setAudit] = useState<AuditRecord | null>(null);
  const [showPII, setShowPII] = useState(false);
  useEffect(() => {
    if (id) getAuditById(id).then(setAudit);
  }, [id]);
  const handlePIIToggle = (checked: boolean) => {
    if (checked) {
      const confirmed = window.confirm('Privacy Alert: Unmasking reveals sensitive data locally. This data never leaves your device. Continue?');
      if (confirmed) setShowPII(true);
    } else {
      setShowPII(false);
    }
  };
  const handleLegalExport = () => {
    if (!audit) return;
    const blob = new Blob([exportLegalAuditPackage(audit)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Education_Review_Export_${audit.id.substring(0, 8)}.json`;
    a.click();
    toast.success('Redacted Review Exported');
  };
  if (!audit) return <div className="py-20 text-center text-muted-foreground animate-pulse">Retrieving review record...</div>;
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div className="space-y-3">
          <Button variant="ghost" asChild className="-ml-4 h-8 px-2 text-muted-foreground hover:text-foreground">
            <Link to="/history"><ArrowLeft className="h-4 w-4 mr-2" /> History</Link>
          </Button>
          <h1 className="text-4xl font-display font-bold tracking-tight">{audit.fileName}</h1>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="rounded-lg">{format(new Date(audit.date), 'MMMM d, yyyy')}</Badge>
            <Badge className="bg-blue-600 text-white rounded-lg">{audit.planType}</Badge>
            <Badge variant={audit.status === 'clean' ? 'secondary' : 'destructive'} className="rounded-lg font-bold uppercase">
              {audit.status === 'flagged' ? 'REVIEW POINT' : audit.status}
            </Badge>
          </div>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="rounded-2xl border-purple-500 text-purple-600 h-12" onClick={handleLegalExport}>
            <Download className="mr-2 h-4 w-4" /> Education Export
          </Button>
          <Button asChild size="lg" className="rounded-2xl px-8 shadow-lg h-12">
            <Link to="/letters" state={{ audit }}>Generate Dispute</Link>
          </Button>
        </div>
      </div>
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
        <p className="text-xs font-medium text-amber-900 leading-relaxed italic">{BENCHMARK_DISCLAIMER}</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-8 bg-slate-900 text-white rounded-[2rem] border-none">
            <p className="text-xs font-bold uppercase opacity-60 tracking-widest">Review Point Value</p>
            <p className="text-6xl font-bold mt-2 tracking-tighter">${audit.totalAmount.toLocaleString()}</p>
          </Card>
          <Tabs defaultValue="points" className="w-full">
            <TabsList className="bg-muted p-1 rounded-xl mb-6">
              <TabsTrigger value="points" className="rounded-lg">Review Points</TabsTrigger>
              <TabsTrigger value="evidence" className="rounded-lg">Benchmark Logic</TabsTrigger>
              <TabsTrigger value="raw" className="rounded-lg">Secure Data</TabsTrigger>
            </TabsList>
            <TabsContent value="points" className="space-y-6">
              {audit.reviewPoints.map((point, idx) => (
                <Card key={idx} className="rounded-2xl border-muted/50 p-6 flex gap-4">
                  <Activity className="h-6 w-6 text-primary shrink-0" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-sm uppercase tracking-wide">{point.type.replace('-', ' ')}</p>
                      <Badge className={point.severity === 'high' ? 'bg-red-500' : 'bg-amber-500'}>{point.severity}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{point.description}</p>
                    <p className="text-[10px] font-bold text-primary mt-2 uppercase">Ref: {point.taxonomy?.statute_ref}</p>
                  </div>
                </Card>
              ))}
            </TabsContent>
            <TabsContent value="evidence" className="space-y-6">
              {audit.overcharges.map((item, idx) => (
                <Card key={idx} className="rounded-2xl p-6 border-indigo-200 bg-indigo-50/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Gavel className="h-4 w-4 text-indigo-700" />
                    <p className="font-bold text-indigo-900">Education Point: {item.code}</p>
                  </div>
                  <p className="text-sm text-indigo-800 leading-relaxed">{item.description}</p>
                  <div className="mt-4 flex gap-4 text-xs font-bold uppercase tracking-widest text-indigo-400">
                    <span>Benchmark: ${item.benchmarkAmount}</span>
                    <span>Medicare Proxy: ${item.medicareProxyAmount?.toFixed(2)}</span>
                  </div>
                </Card>
              ))}
            </TabsContent>
            <TabsContent value="raw">
              <Card className="rounded-2xl overflow-hidden border-muted/50">
                <div className="p-4 border-b flex justify-between items-center bg-muted/20">
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase"><Lock className="h-3 w-3" /> Redacted Session View</div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="pii" className="text-[10px] uppercase font-bold">Unmask PII</Label>
                    <Switch id="pii" checked={showPII} onCheckedChange={handlePIIToggle} />
                  </div>
                </div>
                <div className="p-8 bg-slate-50 dark:bg-slate-900/50 max-h-[400px] overflow-y-auto">
                  <pre className="font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
                    {showPII && audit.rawText ? audit.rawText : audit.redactedText}
                    {showPII && !audit.rawText && "[PHI MEMORY PURGE ACTIVE - RAW TEXT NOT PRESERVED]"}
                  </pre>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        <div className="space-y-6">
           <div className="bg-indigo-600 text-white rounded-3xl p-6 shadow-xl">
             <h3 className="font-bold flex items-center gap-2 text-lg mb-2"><ShieldCheck className="h-5 w-5" /> Education Assistant</h3>
             <p className="text-xs opacity-90 leading-relaxed italic">{PA_DOI_DISCLAIMER}</p>
           </div>
           <Card className="rounded-3xl border-muted/50 p-6">
             <h4 className="font-bold mb-4 uppercase text-[10px] text-muted-foreground tracking-widest">Facility Metadata</h4>
             <div className="space-y-4">
               <div className="flex justify-between text-sm">
                 <span className="text-muted-foreground">Provider</span>
                 <span className="font-bold">{audit.extractedData.providerName || 'N/A'}</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-muted-foreground">Service Date</span>
                 <span className="font-bold">{audit.extractedData.dateOfService || 'N/A'}</span>
               </div>
             </div>
           </Card>
        </div>
      </div>
    </div>
  );
}