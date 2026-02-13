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
import { ArrowLeft, AlertTriangle, Lock, ShieldCheck, ClipboardList, Gavel, Download, Fingerprint, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { exportLegalAuditPackage } from '@/lib/audit-engine';
import { toast } from 'sonner';
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
    a.download = `Legal_Audit_Package_${audit.id.substring(0, 8)}.json`;
    a.click();
    toast.success('Legal Audit Package Exported');
  };
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
            <Badge variant={audit.status === 'clean' ? 'secondary' : 'destructive'} className="rounded-lg font-bold uppercase">{audit.status}</Badge>
          </div>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="rounded-2xl border-purple-500 text-purple-600 h-12" onClick={handleLegalExport}>
            <Download className="mr-2 h-4 w-4" /> Legal Package
          </Button>
          <Button asChild size="lg" className="rounded-2xl px-8 shadow-lg h-12">
            <Link to="/letters" state={{ audit }}>Generate Dispute</Link>
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="p-8 bg-slate-900 text-white rounded-[2rem] border-none relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-10"><ShieldCheck className="h-40 w-40 -mr-10 -mt-10" /></div>
              <p className="text-xs font-bold uppercase opacity-60 tracking-widest">Total Billed</p>
              <p className="text-6xl font-bold mt-2 tracking-tighter">${audit.totalAmount.toLocaleString()}</p>
            </Card>
            {audit.fapEligible && (
              <Card className="p-8 bg-indigo-600 text-white rounded-[2rem] border-none shadow-xl shadow-indigo-500/20">
                <p className="text-xs font-bold uppercase opacity-60 tracking-widest">FAP ELIGIBLE</p>
                <p className="text-2xl font-bold mt-2">Hospital Financial Aid screening recommended.</p>
              </Card>
            )}
          </div>
          <Tabs defaultValue="violations" className="w-full">
            <TabsList className="bg-muted p-1 rounded-xl mb-6">
              <TabsTrigger value="violations" className="rounded-lg">Regulatory Analysis</TabsTrigger>
              <TabsTrigger value="evidence" className="rounded-lg">Compliance Evidence</TabsTrigger>
              <TabsTrigger value="raw" className="rounded-lg">Raw Data</TabsTrigger>
            </TabsList>
            <TabsContent value="violations" className="space-y-6">
              {audit.overcharges.map((item, idx) => (
                <Card key={idx} className="rounded-2xl border-amber-200 bg-amber-50/30">
                  <CardHeader className="pb-3 flex-row justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                        <CardTitle className="text-lg">{item.description}</CardTitle>
                      </div>
                      <p className="text-xs text-amber-700 font-medium">Billed: ${item.billedAmount} vs Medicare Proxy: ${item.medicareProxyAmount?.toFixed(2)}</p>
                    </div>
                    {item.legalCitation && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-10 w-10 text-indigo-600 bg-white/50 rounded-full"><Gavel className="h-5 w-5" /></Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 rounded-2xl p-4">
                          <p className="font-bold text-sm text-indigo-700">{item.legalCitation}</p>
                          <p className="text-xs text-muted-foreground mt-1">{item.statutoryReference}</p>
                        </PopoverContent>
                      </Popover>
                    )}
                  </CardHeader>
                </Card>
              ))}
              {audit.flags.map((flag, idx) => (
                <Card key={`flag-${idx}`} className="rounded-2xl border-muted/50 p-6 flex gap-4">
                  <Activity className="h-6 w-6 text-primary shrink-0" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-sm uppercase tracking-wide">{flag.type.replace('-', ' ')}</p>
                      <Badge className={flag.severity === 'high' ? 'bg-red-500' : 'bg-amber-500'}>{flag.severity}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{flag.description}</p>
                    <p className="text-[10px] font-bold text-primary mt-2 uppercase">Statute: {flag.taxonomy?.statute_ref}</p>
                  </div>
                </Card>
              ))}
            </TabsContent>
            <TabsContent value="evidence" className="space-y-6">
              {audit.flags.map((flag, idx) => (
                <Card key={idx} className="rounded-2xl p-6 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                      <Fingerprint className="h-3 w-3" /> Integrity Hash (SHA-256)
                    </Label>
                    <code className="block p-3 bg-muted rounded-lg text-[10px] break-all font-mono opacity-70">
                      {flag.taxonomy?.evidence_hash}
                    </code>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-xl italic text-sm text-foreground/80 border-l-4 border-indigo-500">
                    "{flag.taxonomy?.evidence_snippet}"
                  </div>
                </Card>
              ))}
            </TabsContent>
            <TabsContent value="raw">
              <Card className="rounded-2xl overflow-hidden border-muted/50">
                <div className="p-4 border-b flex justify-between items-center bg-muted/20">
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase"><Lock className="h-3 w-3" /> Secure Redacted View</div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="pii" className="text-[10px] uppercase font-bold">Unmask PII</Label>
                    <Switch id="pii" checked={showPII} onCheckedChange={handlePIIToggle} />
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
                { label: 'Plan Type', value: audit.planType, icon: Gavel },
                { label: 'CPT Detected', value: audit.detectedCpt.join(', ') || 'N/A', icon: ClipboardList }
              ].map((m, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/20">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <m.icon className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase">{m.label}</span>
                  </div>
                  <span className="text-sm font-bold text-foreground truncate max-w-[120px]">{m.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <div className="bg-indigo-600/5 border border-indigo-200 rounded-3xl p-6 space-y-4">
            <h3 className="font-bold flex items-center gap-2 text-indigo-900">
              <ShieldCheck className="h-5 w-5" /> Statutory Basis
            </h3>
            <p className="text-xs text-indigo-800 leading-relaxed">
              This audit identifies potential violations of <strong>PA Act 102</strong> and <strong>42 U.S.C. § 300gg-111</strong>. These results can be used for formal disputes.
            </p>
            <Button className="w-full rounded-xl bg-indigo-600 text-white font-bold" asChild>
              <Link to="/resources">Learn Your Rights</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}