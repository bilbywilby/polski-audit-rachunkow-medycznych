import React, { useEffect, useState } from 'react';
import { getAllAudits, deleteAudit, AuditRecord } from '@/lib/db';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText, Trash2, ArrowUpRight, Search } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
export function HistoryPage() {
  const [audits, setAudits] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadAudits();
  }, []);
  async function loadAudits() {
    try {
      const data = await getAllAudits();
      setAudits(data);
    } catch (e) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  }
  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this audit?')) return;
    try {
      await deleteAudit(id);
      setAudits(prev => prev.filter(a => a.id !== id));
      toast.success('Audit deleted');
    } catch (e) {
      toast.error('Failed to delete audit');
    }
  }
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground italic">
        Loading your local audit history...
      </div>
    );
  }
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Audit History</h1>
          <p className="text-muted-foreground">Local records of your previous medical bill scans.</p>
        </div>
        <Button asChild>
          <Link to="/audit">New Audit</Link>
        </Button>
      </div>
      {audits.length === 0 ? (
        <Card className="border-dashed py-20 text-center">
          <CardContent className="flex flex-col items-center gap-4">
            <Search className="h-12 w-12 text-muted-foreground/50" />
            <div className="space-y-2">
              <p className="text-xl font-medium">No audits found</p>
              <p className="text-muted-foreground">Start by scanning your first medical bill.</p>
            </div>
            <Button asChild className="mt-4">
              <Link to="/audit">Start First Audit</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {audits.map((audit) => (
            <Card key={audit.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <Badge variant={audit.status === 'clean' ? 'secondary' : 'destructive'} className="shrink-0">
                    {audit.status.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(audit.date), 'MMM d, yyyy')}
                  </span>
                </div>
                <CardTitle className="text-lg line-clamp-1 mt-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  {audit.fileName}
                </CardTitle>
                <CardDescription>
                  ${audit.totalAmount.toLocaleString()} detected
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="text-sm text-muted-foreground">
                  {audit.flags.length} potential issue{audit.flags.length !== 1 ? 's' : ''} identified.
                </div>
              </CardContent>
              <CardFooter className="flex justify-between gap-2 border-t pt-4">
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(audit.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/audit`}>
                    Re-Audit <ArrowUpRight className="ml-2 h-4 w-4" />
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