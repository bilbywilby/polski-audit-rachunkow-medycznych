import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAuditById, AuditRecord } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowLeft, AlertTriangle, FileText, Lock, ShieldCheck, ClipboardList, Info, Gavel, Fingerprint } from 'lucide-react';
import { format } from 'date-fns';
export function AuditDetailsPage() {
  const { id } = useParams();
  const [audit, setAudit] = useState<AuditRecord | null>(null);
  const [showPII, setShowPII] = useState(false);
  useEffect(() => {
    if (id) getAuditById(id).then(setAudit);
  }, [id]);
  if (!audit) return <div className="py-20 text-center text-muted-foreground animate-pulse">Retrieving audit record...</div>;
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
            {audit.zipCode && <Badge variant="secondary" className="rounded-lg">ZIP: {audit.zipCode}</Badge>}
            <Badge variant={audit.status === 'clean' ? 'secondary' : 'destructive'} className="rounded-lg font-bold">
              {audit.status.toUpperCase()}
            </Badge>
          </div>
        </div>
        <Button asChild size="lg" className="rounded-2xl px-8 shadow-lg">
          <Link to="/letters" state={{ audit }}>Generate Dispute</Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-8 bg-primary text-primary-foreground rounded-3xl border-none overflow-hidden relative">
            <div className="absolute top-0 right-0 p-10 opacity-10">
              <ShieldCheck className="h-40 w-40 -mr-10 -mt-10" />
            </div>
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase opacity-80 tracking-widest">Total Amount Billed</p>
              <p className="text-6xl font-bold mt-2 tracking-tighter">${audit.totalAmount.toLocaleString()}</p>
            </div>
          </Card>
          <Tabs defaultValue="violations" className="w-full">
            <TabsList className="bg-muted p-1 rounded-xl mb-6">
              <TabsTrigger value="violations" className="rounded-lg">Regulatory Analysis</TabsTrigger>
              <TabsTrigger value="evidence" className="rounded-lg">Compliance Evidence</TabsTrigger>
              <TabsTrigger value="raw" className="rounded-lg">Raw Data</TabsTrigger>
            </TabsList>
            <TabsContent value="violations" className="space-y-6">
              {audit.flags.map((flag, idx) => (
                <Card key={idx} className="rounded-2xl border-amber-200 bg-amber-50/30 overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                        <CardTitle className="text-lg">{flag.description}</CardTitle>
                      </div>
                      <Badge className={flag.severity === 'high' ? 'bg-red-500' : 'bg-amber-500'}>{flag.severity}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-white/60 rounded-xl border border-amber-100">
                      <Gavel className="h-4 w-4 text-amber-700 mt-1" />
                      <div>
                        <p className="text-xs font-bold text-amber-900 uppercase">Statutory Reference</p>
                        <p className="text-sm text-amber-800 font-medium">{flag.taxonomy?.statute_ref}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {audit.flags.length === 0 && (
                <div className="py-20 text-center text-muted-foreground italic border-2 border-dashed rounded-3xl">
                  No statutory violations detected in this bill.
                </div>
              )}
            </TabsContent>
            <TabsContent value="evidence" className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 p-6 rounded-3xl space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-blue-600" />
                  <h3 className="font-bold text-blue-900">Audit Integrity Chain</h3>
                </div>
                <p className="text-sm text-blue-800 leading-relaxed">
                  The following hashes verify that the audit was performed on the original document. 
                  These snippets are redacted for privacy while maintaining enough context for legal verification.
                </p>
              </div>
              {audit.flags.map((flag, idx) => (
                <Card key={idx} className="rounded-2xl border-muted/50">
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                        <Fingerprint className="h-3 w-3" /> Evidence Hash (SHA-256)
                      </Label>
                      <code className="block p-3 bg-muted rounded-lg text-[10px] break-all font-mono opacity-70">
                        {flag.taxonomy?.evidence_hash}
                      </code>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground">Original Text Line</Label>
                      <div className="p-4 bg-muted/30 rounded-xl italic text-sm text-foreground/80 border-l-4 border-primary/20">
                        "{flag.taxonomy?.evidence_snippet}"
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            <TabsContent value="raw">
              <Card className="rounded-2xl border-muted/50 overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center bg-muted/20">
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase">
                    <Lock className="h-3 w-3" /> Secure Redacted View
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="pii" className="text-[10px] uppercase font-bold">Unmask</Label>
                    <Switch id="pii" checked={showPII} onCheckedChange={(v) => {
                      if (v && confirm('Privacy Alert: Unmasking reveals sensitive data locally. Continue?')) setShowPII(true);
                      else setShowPII(false);
                    }} />
                  </div>
                </div>
                <div className="p-8 bg-slate-50 dark:bg-slate-900/50 max-h-[500px] overflow-y-auto">
                  <pre className="font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
                    {showPII ? audit.rawText : audit.redactedText}
                  </pre>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        <div className="space-y-6">
          <Card className="rounded-3xl border-muted/50 shadow-sm">
            <CardHeader><CardTitle className="text-lg">Metadata</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Facility', value: audit.extractedData.providerName, icon: ShieldCheck },
                { label: 'Date of Service', value: audit.extractedData.dateOfService, icon: FileText },
                { label: 'Plan Type', value: audit.planType, icon: Gavel },
                { label: 'Service ZIP', value: audit.zipCode || 'Not detected', icon: Lock }
              ].map((m, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/20">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <m.icon className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase">{m.label}</span>
                  </div>
                  <span className="text-sm font-bold text-foreground">{m.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <TooltipProvider>
            <Card className="rounded-3xl bg-blue-600 text-white p-6 shadow-xl shadow-blue-500/20">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  <h3 className="font-bold">Privacy Enforcement</h3>
                </div>
                <p className="text-xs opacity-90 leading-relaxed">
                  This audit is compliant with Pennsylvania HIPAA standards. Records are stored for 7 years in your browser's local sandbox.
                </p>
                <Button variant="secondary" className="w-full rounded-xl font-bold" asChild>
                  <Link to="/resources">Learn Your Rights</Link>
                </Button>
              </div>
            </Card>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}