import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAuditById, AuditRecord } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Download, 
  Activity, 
  Info, 
  Gavel, 
  Lock,
  Phone
} from 'lucide-react';
import { format } from 'date-fns';
import { exportLegalAuditPackage } from '@/lib/audit-engine';
import { toast } from 'sonner';
import { BENCHMARK_DISCLAIMER, PA_DOI_HOTLINE } from '@/data/constants';
export function AuditDetailsPage() {
  const { id } = useParams();
  const [audit, setAudit] = useState<AuditRecord | null>(null);
  useEffect(() => {
    if (id) getAuditById(id).then(setAudit);
  }, [id]);
  if (!audit) return <div className="py-20 text-center animate-pulse">Loading review details...</div>;
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div className="space-y-3">
          <Button variant="ghost" asChild className="-ml-4 h-8 px-2">
            <Link to="/history"><ArrowLeft className="h-4 w-4 mr-2" /> History</Link>
          </Button>
          <h1 className="text-4xl font-display font-bold tracking-tight">{audit.fileName}</h1>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="rounded-lg">{format(new Date(audit.date), 'MMMM d, yyyy')}</Badge>
            <Badge className="bg-primary text-primary-foreground rounded-lg">{audit.planType}</Badge>
            <Badge variant="secondary" className="rounded-lg font-bold">TRANSPARENCY REVIEW</Badge>
          </div>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="rounded-2xl border-purple-500 text-purple-600 h-12" onClick={() => {
            const blob = new Blob([exportLegalAuditPackage(audit)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `Redacted_Review_${audit.id.slice(0,8)}.json`; a.click();
            toast.success('Redacted Package Exported');
          }}>
            <Download className="mr-2 h-4 w-4" /> Export JSON
          </Button>
          <Button asChild size="lg" className="rounded-2xl h-12 shadow-lg">
            <Link to="/letters" state={{ audit }}>Generate Dispute</Link>
          </Button>
        </div>
      </div>
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 mt-0.5" />
        <p className="text-xs font-medium text-blue-900 italic">{BENCHMARK_DISCLAIMER}</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-10 bg-slate-900 text-white rounded-[2.5rem] border-none shadow-xl">
            <p className="text-xs font-bold uppercase opacity-60 tracking-widest">Reviewed Base Amount</p>
            <p className="text-6xl font-bold mt-2 tracking-tighter">${audit.totalAmount.toLocaleString()}</p>
          </Card>
          <Tabs defaultValue="points" className="w-full">
            <TabsList className="bg-muted p-1 rounded-xl mb-6">
              <TabsTrigger value="points" className="rounded-lg">Transparency Flags</TabsTrigger>
              <TabsTrigger value="protected" className="rounded-lg">Protected View</TabsTrigger>
            </TabsList>
            <TabsContent value="points" className="space-y-6">
              {audit.reviewPoints.map((point, idx) => (
                <Card key={idx} className="rounded-2xl border-muted/50 p-6 flex gap-4 shadow-sm">
                  <Activity className="h-6 w-6 text-primary shrink-0" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-sm uppercase tracking-wide">{point.type.replace('-', ' ')}</p>
                      <Badge className={point.severity === 'high' ? 'bg-red-500' : 'bg-amber-500'}>{point.severity}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{point.description}</p>
                    <p className="text-[10px] font-bold text-primary mt-2 uppercase">Statutory Basis: {point.taxonomy?.statute_ref}</p>
                  </div>
                </Card>
              ))}
            </TabsContent>
            <TabsContent value="protected">
              <Card className="rounded-2xl overflow-hidden border-muted/50 shadow-sm">
                <div className="p-4 border-b flex justify-between items-center bg-muted/20">
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase">
                    <Lock className="h-3 w-3" /> PII-Scrubbed Content
                  </div>
                </div>
                <div className="p-8 bg-slate-50 dark:bg-slate-900/50 max-h-[500px] overflow-y-auto">
                  <pre className="font-mono text-[11px] leading-relaxed whitespace-pre-wrap italic text-muted-foreground">
                    {audit.redactedText}
                  </pre>
                  <div className="mt-6 pt-4 border-t border-dashed text-center">
                    <p className="text-[10px] uppercase font-bold text-red-500 tracking-tighter">
                      Original PII Purged from Memory - Data Zero Policy Active
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        <div className="space-y-6">
           <div className="bg-indigo-600 text-white rounded-[2.5rem] p-8 shadow-xl">
             <h3 className="font-bold flex items-center gap-2 text-xl mb-4"><ShieldCheck className="h-6 w-6 text-blue-400" /> Statutory Helper</h3>
             <div className="space-y-4 text-sm opacity-90 leading-relaxed italic">
               <p>All analysis follows Pennsylvania Act 102 Quality Standards.</p>
               <div className="pt-4 border-t border-white/20">
                 <p className="text-xs uppercase font-bold opacity-70 mb-1">PA DOI Hotline</p>
                 <p className="text-2xl font-mono font-bold text-blue-300">{PA_DOI_HOTLINE}</p>
               </div>
             </div>
           </div>
           <Card className="rounded-3xl border-muted/50 p-6 shadow-sm">
             <h4 className="font-bold mb-4 uppercase text-[10px] text-muted-foreground tracking-widest">Metadata Context</h4>
             <div className="space-y-4">
               <div className="flex justify-between text-sm">
                 <span className="text-muted-foreground">Review ID</span>
                 <span className="font-mono font-bold text-[10px]">{audit.id.slice(0,12)}</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-muted-foreground">Plan Category</span>
                 <span className="font-bold">{audit.planType}</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-muted-foreground">Fingerprint</span>
                 <span className="font-mono text-[10px] opacity-50">{audit.fingerprint?.slice(0,16)}</span>
               </div>
             </div>
           </Card>
        </div>
      </div>
    </div>
  );
}