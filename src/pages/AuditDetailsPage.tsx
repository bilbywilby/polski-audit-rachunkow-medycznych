import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getAuditById, AuditRecord, deleteAudit } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  AlertTriangle,
  FileText,
  Trash2,
  ArrowRight,
  ClipboardCheck,
  SearchCode,
  Calendar,
  Info
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
export function AuditDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [audit, setAudit] = useState<AuditRecord | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function fetchAudit() {
      if (!id) return;
      try {
        const record = await getAuditById(id);
        if (record) {
          setAudit(record);
        } else {
          toast.error('Audit not found');
          navigate('/history');
        }
      } catch (e) {
        toast.error('Error loading audit');
      } finally {
        setLoading(false);
      }
    }
    fetchAudit();
  }, [id, navigate]);
  const handleDelete = async () => {
    if (!audit || !confirm('Delete this audit record?')) return;
    try {
      await deleteAudit(audit.id);
      toast.success('Record removed');
      navigate('/history');
    } catch (e) {
      toast.error('Failed to delete');
    }
  };
  if (loading) return <div className="py-20 text-center italic text-muted-foreground">Loading audit details...</div>;
  if (!audit) return null;
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12 space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="space-y-3">
            <Button variant="ghost" asChild className="mb-4 -ml-4 rounded-xl">
              <Link to="/history"><ArrowLeft className="mr-2 h-4 w-4" /> Back to History</Link>
            </Button>
            <h1 className="text-4xl font-display font-bold">{audit.fileName}</h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {format(new Date(audit.date), 'MMMM d, yyyy')}</span>
              <Badge variant={audit.status === 'clean' ? 'default' : 'destructive'} className="h-6">
                {audit.status.toUpperCase()}
              </Badge>
            </div>
          </div>
          <div className="flex gap-3 h-fit">
            <Button variant="outline" className="text-destructive rounded-xl border-destructive/20 hover:bg-destructive/5" onClick={handleDelete}>
              <Trash2 className="h-5 w-5" />
            </Button>
            <Button className="rounded-xl shadow-lg shadow-primary/20" asChild>
              <Link to="/letters" state={{ audit }}>
                Dispute this bill <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-muted/50 p-1 h-12 rounded-2xl border">
            <TabsTrigger value="overview" className="rounded-xl px-8 data-[state=active]:bg-background">Analysis Overview</TabsTrigger>
            <TabsTrigger value="raw" className="rounded-xl px-8 data-[state=active]:bg-background">Raw Text Inspector</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <Card className="rounded-3xl border-muted/50">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <ClipboardCheck className="h-6 w-6 text-primary" />
                      Detected Medical Codes
                    </CardTitle>
                    <CardDescription>Comprehensive identification of billing codes found in the document.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Procedures (CPT)</p>
                        <div className="flex flex-wrap gap-2">
                          {audit.detectedCpt.map(code => <Badge key={code} variant="secondary" className="bg-blue-50 text-blue-700">{code}</Badge>)}
                          {audit.detectedCpt.length === 0 && <p className="text-sm italic text-muted-foreground">None</p>}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Diagnoses (ICD-10)</p>
                        <div className="flex flex-wrap gap-2">
                          {audit.detectedIcd.map(code => <Badge key={code} variant="outline" className="border-primary/20">{code}</Badge>)}
                          {audit.detectedIcd.length === 0 && <p className="text-sm italic text-muted-foreground">None</p>}
                        </div>
                      </div>
                      {audit.detectedHcpcs && audit.detectedHcpcs.length > 0 && (
                        <div className="space-y-3">
                          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Supplies (HCPCS)</p>
                          <div className="flex flex-wrap gap-2">
                            {audit.detectedHcpcs.map(code => <Badge key={code} variant="secondary" className="bg-indigo-50 text-indigo-700">{code}</Badge>)}
                          </div>
                        </div>
                      )}
                      {audit.detectedRevenue && audit.detectedRevenue.length > 0 && (
                        <div className="space-y-3">
                          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Revenue Codes</p>
                          <div className="flex flex-wrap gap-2">
                            {audit.detectedRevenue.map(code => <Badge key={code} variant="secondary" className="bg-orange-50 text-orange-700">{code}</Badge>)}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                <Card className="rounded-3xl border-muted/50">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <SearchCode className="h-6 w-6 text-primary" />
                      Facility & Provider Data
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row gap-6">
                      <div className="flex-1 p-6 bg-muted/40 rounded-2xl">
                        <p className="text-sm font-medium text-muted-foreground">Total Detected Amount</p>
                        <p className="text-4xl font-bold mt-1">${audit.totalAmount.toLocaleString()}</p>
                      </div>
                      {audit.detectedNpi && audit.detectedNpi.length > 0 && (
                        <div className="flex-1 p-6 bg-primary/5 rounded-2xl border border-primary/10">
                          <p className="text-sm font-medium text-primary">Detected NPIs</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {audit.detectedNpi.map(npi => <Badge key={npi} className="bg-primary text-primary-foreground">{npi}</Badge>)}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-6">
                <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900 border-2 rounded-3xl">
                  <CardHeader>
                    <CardTitle className="text-amber-800 dark:text-amber-400 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" /> Audit Findings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {audit.flags.length > 0 ? (
                      audit.flags.map((flag, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-white/60 dark:bg-black/20 border border-amber-200/50 shadow-sm">
                          <div className="flex justify-between items-center mb-2">
                            <p className="font-bold text-amber-900 dark:text-amber-300 text-xs uppercase tracking-tighter">
                              {flag.type.replace('-', ' ')}
                            </p>
                            <Badge variant="outline" className={flag.severity === 'high' ? 'border-red-500 text-red-600' : 'border-amber-600 text-amber-700'}>
                              {flag.severity}
                            </Badge>
                          </div>
                          <p className="text-amber-800/90 dark:text-amber-400/90 text-sm leading-relaxed">
                            {flag.description}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 space-y-2">
                        <ClipboardCheck className="h-10 w-10 text-green-500 mx-auto" />
                        <p className="font-bold text-green-700">No Issues Found</p>
                        <p className="text-xs text-green-600/70 italic">Standard heuristic checks passed.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Card className="rounded-3xl bg-primary text-primary-foreground p-1 overflow-hidden">
                  <CardContent className="p-6">
                    <h4 className="font-bold mb-2 flex items-center gap-2"><Info className="h-4 w-4" /> Pro Tip</h4>
                    <p className="text-sm opacity-90 leading-relaxed">
                      Revenue codes like <strong>0450</strong> indicate Emergency Room services. Always check if you were billed an "ER Room Charge" separate from the doctor's visit.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="raw">
            <Card className="rounded-3xl border-muted/50 overflow-hidden">
              <CardHeader className="bg-muted/30">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" /> Extracted Document Text
                </CardTitle>
                <CardDescription>Processed raw text data from your document for audit verification.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <pre className="p-8 text-[13px] font-mono whitespace-pre-wrap leading-relaxed max-h-[600px] overflow-y-auto bg-muted/10">
                  {audit.rawText || "No text extracted."}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}