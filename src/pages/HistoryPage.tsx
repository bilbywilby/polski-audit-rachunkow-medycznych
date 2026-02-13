import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { getAllAudits, deleteAudit, AuditRecord, clearAllHistory } from '@/lib/db';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { FileText, Trash2, ArrowUpRight, Search, Eraser, Gavel, ShieldCheck, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
export function HistoryPage() {
  const [audits, setAudits] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const loadAudits = useCallback(async () => {
    try {
      const data = await getAllAudits();
      setAudits(data);
    } catch (e) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    loadAudits();
  }, [loadAudits]);
  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this redacted review?')) return;
    try {
      await deleteAudit(id);
      setAudits(prev => prev.filter(a => a.id !== id));
      toast.success('Review deleted');
    } catch (e) {
      toast.error('Deletion failed');
    }
  };
  const filteredAudits = useMemo(() => {
    return audits.filter(a =>
      a.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [audits, searchTerm]);
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground italic">Retrieving transparency records...</p>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-display font-bold">Review History</h1>
          <p className="text-lg text-muted-foreground">Historical billing transparency assistant sessions.</p>
        </div>
        <div className="flex gap-3">
          {audits.length > 0 && (
            <Button variant="outline" onClick={async () => {
              if (confirm('Delete ALL history?')) {
                await clearAllHistory();
                setAudits([]);
                toast.success('History cleared');
              }
            }} className="rounded-xl border-destructive/30 text-destructive hover:bg-destructive/5">
              <Eraser className="mr-2 h-4 w-4" /> Clear All
            </Button>
          )}
          <Button asChild className="rounded-xl h-11 px-6 shadow-lg shadow-primary/20">
            <Link to="/audit">New Review</Link>
          </Button>
        </div>
      </div>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search reviews..."
          className="pl-10 h-12 rounded-2xl shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {filteredAudits.length === 0 ? (
        <Card className="border-dashed py-32 text-center rounded-[3rem] bg-muted/5 border-2">
          <CardContent className="flex flex-col items-center gap-6">
            <div className="p-6 bg-muted rounded-full">
              <FileText className="h-12 w-12 text-muted-foreground/30" />
            </div>
            <p className="text-xl font-bold text-muted-foreground">No transparency sessions found</p>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/audit">Start Your First Review</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAudits.map((audit) => (
            <Card key={audit.id} className="group hover:shadow-xl transition-all duration-300 rounded-[2rem] border-muted/60 flex flex-col overflow-hidden bg-card/50">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <Badge variant={audit.status === 'clean' ? 'secondary' : 'destructive'} className="rounded-lg">
                    {audit.status === 'flagged' ? 'REVIEW POINT' : 'CLEAN'}
                  </Badge>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 text-green-600 text-[10px] font-bold rounded-full uppercase">
                    <Lock className="h-3 w-3" /> PII Purged
                  </div>
                </div>
                <CardTitle className="text-xl line-clamp-1 mt-4">
                  {audit.fileName}
                </CardTitle>
                <CardDescription className="font-bold text-foreground text-lg">
                  ${audit.totalAmount.toLocaleString()} Base
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pb-6 space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground flex items-center gap-1"><Gavel className="h-3 w-3" /> {audit.planType}</span>
                  <span className="text-muted-foreground">{format(new Date(audit.date), 'MMM d, yyyy')}</span>
                </div>
                <div className="p-3 bg-muted/30 rounded-xl border border-dashed text-[10px] text-muted-foreground italic line-clamp-2">
                  {audit.redactedText.substring(0, 100)}...
                </div>
              </CardContent>
              <CardFooter className="flex justify-between gap-3 border-t bg-muted/20 p-5">
                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 rounded-xl" onClick={() => handleDelete(audit.id)}>
                  <Trash2 className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="sm" className="rounded-xl flex-1 h-10 shadow-sm" asChild>
                  <Link to={`/audit/${audit.id}`}>
                    Details <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}