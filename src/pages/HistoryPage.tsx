import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { getAllAudits, deleteAudit, AuditRecord } from '@/lib/db';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar, FileText, Trash2, ArrowUpRight, Search, TrendingUp, ShieldCheck } from 'lucide-react';
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
      console.error(e);
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    loadAudits();
  }, [loadAudits]);
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record permanently?')) return;
    try {
      await deleteAudit(id);
      setAudits(prev => prev.filter(a => a.id !== id));
      toast.success('Record deleted');
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete audit');
    }
  };
  const filteredAudits = useMemo(() => {
    return audits.filter(a => 
      a.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [audits, searchTerm]);
  const totalFlaggedAmount = useMemo(() => {
    return audits.reduce((sum, a) => a.status !== 'clean' ? sum + a.totalAmount : sum, 0);
  }, [audits]);
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground italic">Retrieving secure records...</p>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12 space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-display font-bold">Audit History</h1>
            <p className="text-lg text-muted-foreground">Manage your past scans and dispute findings.</p>
          </div>
          <Button asChild size="lg" className="rounded-xl">
            <Link to="/audit">New Audit</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-primary text-primary-foreground border-none">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium opacity-80 uppercase tracking-wider">Total Scanned</p>
                  <p className="text-3xl font-bold mt-1">${audits.reduce((s, a) => s + a.totalAmount, 0).toLocaleString()}</p>
                </div>
                <FileText className="h-8 w-8 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-amber-500 text-white border-none">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium opacity-80 uppercase tracking-wider">Potential Savings</p>
                  <p className="text-3xl font-bold mt-1">${totalFlaggedAmount.toLocaleString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-green-500 text-white border-none">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium opacity-80 uppercase tracking-wider">Active Disputes</p>
                  <p className="text-3xl font-bold mt-1">{audits.filter(a => a.status === 'flagged').length}</p>
                </div>
                <ShieldCheck className="h-8 w-8 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search by filename..." 
            className="pl-10 h-12 rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {filteredAudits.length === 0 ? (
          <Card className="border-dashed py-24 text-center rounded-3xl">
            <CardContent className="flex flex-col items-center gap-6">
              <div className="p-6 bg-muted rounded-full">
                <Search className="h-12 w-12 text-muted-foreground/30" />
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold">No records found</p>
                <p className="text-muted-foreground max-w-xs mx-auto">
                  {searchTerm ? `No audits match "${searchTerm}"` : "You haven't performed any audits yet."}
                </p>
              </div>
              {!searchTerm && (
                <Button asChild className="rounded-xl px-8 h-12">
                  <Link to="/audit">Start First Audit</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAudits.map((audit) => (
              <Card key={audit.id} className="group hover:shadow-xl transition-all duration-300 rounded-3xl border-muted/60 flex flex-col">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start gap-2">
                    <Badge 
                      variant={audit.status === 'clean' ? 'secondary' : 'destructive'} 
                      className={`px-3 ${audit.status === 'clean' ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}`}
                    >
                      {audit.status.toUpperCase()}
                    </Badge>
                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(new Date(audit.date), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <CardTitle className="text-xl line-clamp-1 mt-4 flex items-center gap-2 group-hover:text-primary transition-colors">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    {audit.fileName}
                  </CardTitle>
                  <CardDescription className="text-base font-semibold text-foreground">
                    ${audit.totalAmount.toLocaleString()} detected
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-6">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {audit.flags.length > 0 
                      ? `${audit.flags.length} issue${audit.flags.length !== 1 ? 's' : ''} require attention.` 
                      : "Clean bill: No automatic flags detected."}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between gap-3 border-t bg-muted/20 p-5 rounded-b-3xl">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
                    onClick={() => handleDelete(audit.id)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-xl flex-1 h-10" asChild>
                    <Link to={`/audit/${audit.id}`}>
                      View Details <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}