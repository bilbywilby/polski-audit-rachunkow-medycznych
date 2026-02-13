import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAuditById, AuditRecord } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft, AlertTriangle, FileText, Lock, Eye, EyeOff, ShieldCheck, ClipboardList } from 'lucide-react';
import { format } from 'date-fns';
export function AuditDetailsPage() {
  const { id } = useParams();
  const [audit, setAudit] = useState<AuditRecord | null>(null);
  const [showPII, setShowPII] = useState(false);
  useEffect(() => {
    if (id) getAuditById(id).then(setAudit);
  }, [id]);
  if (!audit) return <div className="py-20 text-center text-muted-foreground animate-pulse">Retriving audit record...</div>;
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div className="space-y-3">
          <Button variant="ghost" asChild className="-ml-4 h-8 px-2 text-muted-foreground hover:text-foreground">
            <Link to="/history"><ArrowLeft className="h-4 w-4 mr-2" /> Return to History</Link>
          </Button>
          <h1 className="text-4xl font-display font-bold tracking-tight">{audit.fileName}</h1>
          <div className="flex gap-3">
            <Badge variant="outline" className="rounded-lg">{format(new Date(audit.date), 'MMMM d, yyyy')}</Badge>
            <Badge 
              variant={audit.status === 'clean' ? 'secondary' : 'destructive'}
              className="rounded-lg uppercase font-bold tracking-wider"
            >
              {audit.status}
            </Badge>
          </div>
        </div>
        <div className="flex gap-3">
           <Button asChild size="lg" className="rounded-2xl px-8 shadow-lg shadow-primary/10">
            <Link to="/letters" state={{ audit }}>Generate Dispute Letter</Link>
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Facility Name', val: audit.extractedData.providerName, icon: ShieldCheck },
          { label: 'Service Date', val: audit.extractedData.dateOfService, icon: FileText },
          { label: 'Account Number', val: showPII ? (audit.extractedData.accountNumber || 'Unknown') : '••••••••', icon: Lock },
          { label: 'Policy ID', val: showPII ? (audit.extractedData.policyId || 'Unknown') : '••••••••', icon: Lock }
        ].map((s, i) => (
          <Card key={i} className="p-5 bg-muted/30 border-none shadow-none rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">{s.label}</p>
            </div>
            <p className="font-bold line-clamp-1 text-foreground">{s.val || 'Not Detected'}</p>
          </Card>
        ))}
      </div>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-muted/50 rounded-xl p-1 mb-8">
          <TabsTrigger value="overview" className="rounded-lg px-8 py-2">Audit Analysis</TabsTrigger>
          <TabsTrigger value="raw" className="rounded-lg px-8 py-2">Document Inspector</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-8 bg-primary text-primary-foreground rounded-3xl border-none overflow-hidden relative">
                <div className="absolute top-0 right-0 p-10 opacity-10">
                  <ClipboardList className="h-40 w-40 -mr-10 -mt-10" />
                </div>
                <div className="relative z-10">
                  <p className="text-xs font-bold uppercase opacity-80 tracking-widest">Grand Total Billed</p>
                  <p className="text-6xl font-bold mt-2 tracking-tighter">${audit.totalAmount.toLocaleString()}</p>
                </div>
              </Card>
              <Card className="rounded-[2rem] border-muted/50 overflow-hidden">
                <CardHeader className="bg-muted/10">
                  <CardTitle className="flex items-center gap-2">Detected Medical Codes</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                    <div className="space-y-4">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">CPT (Procedures)</p>
                      <div className="flex flex-wrap gap-2">
                        {audit.detectedCpt.length > 0 ? audit.detectedCpt.map(c => (
                          <Badge key={c} variant="secondary" className="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 border-none rounded-lg">{c}</Badge>
                        )) : <p className="text-sm italic text-muted-foreground">None detected</p>}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">ICD-10 (Diagnoses)</p>
                      <div className="flex flex-wrap gap-2">
                        {audit.detectedIcd.length > 0 ? audit.detectedIcd.map(c => (
                          <Badge key={c} variant="outline" className="px-3 py-1 border-muted-foreground/20 rounded-lg">{c}</Badge>
                        )) : <p className="text-sm italic text-muted-foreground">None detected</p>}
                      </div>
                    </div>
                  </div>
                  {(audit.detectedHcpcs?.length ?? 0) > 0 && (
                    <div className="space-y-4 pt-4 border-t border-dashed">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">HCPCS (Supplies/Injections)</p>
                      <div className="flex flex-wrap gap-2">
                        {audit.detectedHcpcs?.map(c => (
                          <Badge key={c} variant="secondary" className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg border-none">{c}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 rounded-[2rem] overflow-hidden">
                <CardHeader className="border-b border-amber-200 pb-4">
                  <CardTitle className="text-amber-800 dark:text-amber-400 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" /> Flagged Violations
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {audit.flags.length > 0 ? audit.flags.map((f, i) => (
                    <div key={i} className="p-4 bg-white/60 dark:bg-black/20 border border-amber-200/50 rounded-2xl space-y-2">
                      <Badge className={f.severity === 'high' ? 'bg-red-500' : 'bg-amber-500'}>
                        {f.severity.toUpperCase()}
                      </Badge>
                      <p className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wide">Violation: {f.type.replace('-', ' ')}</p>
                      <p className="text-sm text-amber-800/80 dark:text-amber-400/80 leading-relaxed">{f.description}</p>
                    </div>
                  )) : (
                    <div className="py-10 text-center space-y-3">
                      <div className="h-12 w-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                        <ShieldCheck className="h-6 w-6" />
                      </div>
                      <p className="font-bold text-green-800">No Red Flags Found</p>
                      <p className="text-xs text-green-700">This bill appears to align with regional PA standards.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card className="rounded-[2rem] border-muted/50 p-6 space-y-4">
                <h3 className="font-bold text-lg">Next Steps</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Based on your audit results, we recommend generating a dispute notice to the provider's billing department.
                </p>
                <Button asChild className="w-full rounded-xl" variant="outline">
                  <Link to="/resources">View PA Rights Manual</Link>
                </Button>
              </Card>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="raw">
          <Card className="overflow-hidden rounded-[2rem] border-muted/50 shadow-sm">
            <div className="p-6 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center bg-muted/10 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-bold flex items-center gap-2"><FileText className="h-4 w-4" /> Extracted Text Content</p>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest flex items-center gap-1.5">
                  <Lock className="h-3 w-3" /> HIPAA-Compliant Redaction Active
                </p>
              </div>
              <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border shadow-sm">
                <Label htmlFor="pii-toggle" className="text-[10px] uppercase font-bold text-muted-foreground">Show Private Info</Label>
                <Switch 
                  id="pii-toggle"
                  checked={showPII} 
                  onCheckedChange={(v) => { 
                    if (v && confirm('Privacy Alert: Unmasking will reveal sensitive data (Account #, Policy ID). This information is only shown locally in your session. Continue?')) setShowPII(true); 
                    else setShowPII(false); 
                  }} 
                />
              </div>
            </div>
            <div className="p-8 bg-slate-50 dark:bg-slate-900/50 max-h-[600px] overflow-y-auto">
              <pre className="font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-muted-foreground">
                {showPII ? audit.rawText : audit.redactedText}
              </pre>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}