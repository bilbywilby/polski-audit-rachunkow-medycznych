import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAuditById, AuditRecord } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft, AlertTriangle, FileText, Lock, Eye, EyeOff, ShieldCheck, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
export function AuditDetailsPage() {
  const { id } = useParams();
  const [audit, setAudit] = useState<AuditRecord | null>(null);
  const [showPII, setShowPII] = useState(false);
  useEffect(() => {
    if (id) getAuditById(id).then(setAudit);
  }, [id]);
  if (!audit) return <div className="py-20 text-center text-muted-foreground">Loading audit...</div>;
  return (
    <div className="space-y-8">
      <div className="flex justify-between gap-6">
        <div className="space-y-2">
          <Button variant="ghost" asChild className="-ml-4 h-8 px-2"><Link to="/history"><ArrowLeft className="h-4 w-4 mr-2" /> Back</Link></Button>
          <h1 className="text-4xl font-display font-bold">{audit.fileName}</h1>
          <div className="flex gap-4">
            <Badge variant="outline">{format(new Date(audit.date), 'MMM d, yyyy')}</Badge>
            <Badge variant={audit.status === 'clean' ? 'secondary' : 'destructive'}>{audit.status.toUpperCase()}</Badge>
          </div>
        </div>
        <Button asChild size="lg" className="rounded-2xl"><Link to="/letters" state={{ audit }}>Generate Letter</Link></Button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Facility', val: audit.extractedData.providerName },
          { label: 'Date', val: audit.extractedData.dateOfService },
          { label: 'Account', val: showPII ? audit.extractedData.accountNumber : '•••••' },
          { label: 'Policy', val: showPII ? audit.extractedData.policyId : '•••••' }
        ].map((s, i) => (
          <Card key={i} className="p-6 bg-muted/30 border-none shadow-none">
            <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">{s.label}</p>
            <p className="font-bold line-clamp-1">{s.val || 'N/A'}</p>
          </Card>
        ))}
      </div>
      <Tabs defaultValue="overview">
        <TabsList className="bg-muted rounded-xl p-1">
          <TabsTrigger value="overview" className="rounded-lg px-8">Analysis</TabsTrigger>
          <TabsTrigger value="raw" className="rounded-lg px-8">Inspector</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="pt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 bg-primary text-primary-foreground">
                <p className="text-xs font-bold uppercase opacity-80">Total Billed</p>
                <p className="text-4xl font-bold mt-1">${audit.totalAmount.toLocaleString()}</p>
              </Card>
              <Card>
                <CardHeader><CardTitle>Codes Detected</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase mb-2">CPT Procedures</p>
                    <div className="flex flex-wrap gap-2">
                      {audit.detectedCpt.map(c => <Badge key={c} variant="secondary">{c}</Badge>)}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase mb-2">ICD-10 Diagnoses</p>
                    <div className="flex flex-wrap gap-2">
                      {audit.detectedIcd.map(c => <Badge key={c} variant="outline">{c}</Badge>)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200">
              <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Violations</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {audit.flags.map((f, i) => (
                  <div key={i} className="p-4 bg-white/50 border rounded-xl">
                    <p className="text-xs font-bold uppercase">{f.type}</p>
                    <p className="text-sm">{f.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="raw" className="pt-6">
          <Card className="overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-muted/20">
              <p className="text-xs font-bold">Document Source</p>
              <div className="flex items-center gap-2">
                <Label className="text-[10px] uppercase font-bold">Unmask PII</Label>
                <Switch checked={showPII} onCheckedChange={(v) => { if (v && confirm('Warning: This reveals private data like SSN. Continue?')) setShowPII(true); else setShowPII(false); }} />
              </div>
            </div>
            <pre className="p-8 font-mono text-[10px] bg-slate-50 overflow-x-auto">
              {showPII ? audit.rawText : audit.redactedText}
            </pre>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}