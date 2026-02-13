import React, { useEffect, useState, useMemo } from 'react';
import {
  Shield,
  FileSearch,
  History,
  Zap,
  CheckCircle,
  Gavel,
  TrendingUp,
  LineChart,
  ExternalLink,
  Phone
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { getAllAudits, getAllFilings, AuditRecord, InsuranceFilingRecord } from '@/lib/db';
import { useLanguage } from '@/hooks/use-language';
import { PA_DOI_HOTLINE, PA_DOI_PORTAL_URL } from '@/data/constants';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
export function HomePage() {
  const [audits, setAudits] = useState<AuditRecord[]>([]);
  const [filings, setFilings] = useState<InsuranceFilingRecord[]>([]);
  const { t } = useLanguage();
  useEffect(() => {
    async function loadData() {
      try {
        const [auditData, filingData] = await Promise.all([
          getAllAudits(),
          getAllFilings()
        ]);
        setAudits(auditData);
        setFilings(filingData);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      }
    }
    loadData();
  }, []);
  const stats = useMemo(() => {
    const total = audits.reduce((s, a) => s + a.totalAmount, 0);
    const flagged = audits.filter(a => a.status === 'flagged');
    const flaggedAmt = flagged.reduce((s, a) => s + a.totalAmount, 0);
    const validHikes = filings
      .map(f => parseFloat(f.extractedData.avgRateHike?.replace('%', '') || '0'))
      .filter(h => h > 0);
    const avgHike = validHikes.length > 0 ? (validHikes.reduce((a, b) => a + b, 0) / validHikes.length).toFixed(1) : '0';
    return {
      total,
      flaggedCount: flagged.length,
      flaggedAmt,
      hasAudits: audits.length > 0,
      avgHike: `${avgHike}%`
    };
  }, [audits, filings]);
  const distributionData = useMemo(() => {
    const counts: Record<string, number> = {};
    audits.forEach(a => {
      a.reviewPoints?.forEach(p => {
        const type = p.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        counts[type] = (counts[type] || 0) + 1;
      });
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [audits]);
  const COLORS = ['#2563EB', '#6366F1', '#F59E0B', '#EF4444', '#10B981', '#8B5CF6'];
  return (
    <div className="space-y-10 animate-fade-in">
      {/* DOI Link Bar */}
      <div className="bg-blue-600 text-white p-3 rounded-2xl flex flex-wrap items-center justify-between gap-4 px-6 shadow-lg">
        <div className="flex items-center gap-3">
          <Gavel className="h-5 w-5 opacity-80" />
          <p className="text-sm font-bold uppercase tracking-tight">PA Department of Insurance (DOI) Resources</p>
        </div>
        <div className="flex gap-4">
          <a href={`tel:${PA_DOI_HOTLINE}`} className="flex items-center gap-2 text-xs font-bold hover:underline">
            <Phone className="h-3 w-3" /> {PA_DOI_HOTLINE}
          </a>
          <a href={PA_DOI_PORTAL_URL} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-bold hover:underline">
            <ExternalLink className="h-3 w-3" /> Visit DOI Portal
          </a>
        </div>
      </div>
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold">Education Dashboard</h1>
          <p className="text-muted-foreground italic">Managing your healthcare expenses through patient education assistant tools.</p>
        </div>
        <div className="flex gap-4">
          <Button asChild variant="outline" className="rounded-xl px-6 h-12">
            <Link to="/history">
              <History className="mr-2 h-4 w-4" /> History
            </Link>
          </Button>
          <Button asChild className="rounded-xl px-8 h-12 shadow-lg shadow-primary/20">
            <Link to="/audit">New Review</Link>
          </Button>
        </div>
      </header>
      {(!stats.hasAudits && filings.length === 0) ? (
        <section className="text-center py-20 space-y-8 bg-muted/20 rounded-[3rem] border border-dashed border-muted">
          <h2 className="text-3xl font-bold">Ready to Start Your Educational Review?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Upload your medical bill or insurance carrier filing to identify review points based on PA statutory benchmarks.
          </p>
          <Button asChild size="lg" className="rounded-2xl h-16 px-10 text-lg font-bold">
            <Link to="/audit">Start Education Assistant</Link>
          </Button>
        </section>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="rounded-3xl bg-primary text-primary-foreground border-none shadow-xl shadow-primary/10">
              <CardContent className="pt-8">
                <p className="text-xs font-bold opacity-70 uppercase tracking-widest">Est. Review Recovery</p>
                <p className="text-4xl font-bold mt-2">${(stats.flaggedAmt * 0.2).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-muted/50 shadow-sm">
              <CardContent className="pt-8">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Items For Review</p>
                <p className="text-4xl font-bold mt-2 text-red-500">${stats.flaggedAmt.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-muted/50 shadow-sm">
              <CardContent className="pt-8">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Avg Rate Hike (PA)</p>
                <p className="text-4xl font-bold mt-2 text-foreground">{stats.avgHike}</p>
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-muted/50 shadow-sm">
              <CardContent className="pt-8">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Plans Indexed</p>
                <p className="text-4xl font-bold mt-2 text-foreground">{filings.length}</p>
              </CardContent>
            </Card>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="rounded-[2rem] overflow-hidden border-muted/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Platform Distribution</CardTitle>
                <CardDescription>Review points detected across historical sessions</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px] mt-4">
                {distributionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distributionData}
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={8}
                        dataKey="value"
                      >
                        {distributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground italic flex-col gap-2">
                    <CheckCircle className="h-10 w-10 text-green-400 opacity-20" />
                    <p>No systemic review points identified.</p>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="rounded-[2rem] bg-slate-900 text-white p-10 relative overflow-hidden flex flex-col justify-center">
              <div className="absolute top-0 right-0 p-10 opacity-10">
                <LineChart className="h-64 w-64 -mr-16 -mt-16" />
              </div>
              <div className="relative z-10 space-y-6">
                <h3 className="text-3xl font-bold leading-tight">Carrier Transparency Tracker</h3>
                <p className="text-slate-400 max-w-sm leading-relaxed">
                  We've identified {filings.length} filings in the PA market. Use this monitor for patient education on upcoming premium changes.
                </p>
                <Button asChild variant="secondary" className="rounded-xl px-8 h-12 font-bold">
                  <Link to="/insurance-audit">Access Pipeline <TrendingUp className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}