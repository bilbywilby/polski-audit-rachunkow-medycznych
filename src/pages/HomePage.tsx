import React, { useEffect, useState, useMemo } from 'react';
import { 
  Shield, 
  FileSearch, 
  History, 
  Zap, 
  CheckCircle, 
  Gavel, 
  AlertCircle,
  TrendingUp,
  LineChart
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { getAllAudits, getAllFilings, AuditRecord, InsuranceFilingRecord } from '@/lib/db';
import { useLanguage } from '@/hooks/use-language';
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
    getAllAudits().then(setAudits);
    getAllFilings().then(setFilings);
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
    // Add Medical flags
    audits.forEach(a => {
      a.flags.forEach(f => {
        const type = f.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        counts[type] = (counts[type] || 0) + 1;
      });
    });
    // Add Insurance flags
    filings.forEach(f => {
      f.flags.forEach(flag => {
        const type = "Rate: " + flag.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        counts[type] = (counts[type] || 0) + 1;
      });
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [audits, filings]);
  const COLORS = ['#2563EB', '#6366F1', '#F59E0B', '#EF4444', '#10B981', '#8B5CF6'];
  if (!stats.hasAudits && filings.length === 0) {
    return (
      <div className="max-w-5xl mx-auto space-y-16 py-12 animate-fade-in">
        <section className="text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-600 text-sm font-bold border border-blue-500/20">
            <Shield className="h-4 w-4" /> <span>Pennsylvania Healthcare Defense Platform</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-display font-bold text-foreground tracking-tight">
            Stop Overpaying <br /><span className="text-primary italic">Medical Bills.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Audit your Pennsylvania medical statements and carrier rate filings against <strong>Act 102</strong> and the <strong>No Surprises Act</strong>.
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-6">
            <Button asChild size="lg" className="rounded-2xl h-16 px-10 text-lg font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
              <Link to="/audit"><FileSearch className="mr-3 h-6 w-6" /> Start New Audit</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-2xl h-16 px-10 text-lg border-2">
              <Link to="/insurance-audit">Monitor Rate Hikes</Link>
            </Button>
          </div>
        </section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "No Surprises Act", desc: "Automatic checks for out-of-network rates in emergency settings across PA.", icon: Shield, color: "bg-blue-50 text-blue-600" },
            { title: "Insurance Rate Watch", desc: "Audit SERFF filings to see if your carrier is overcharging premiums.", icon: LineChart, color: "bg-green-50 text-green-600" },
            { title: "HIPAA-Friendly", desc: "Private analysis that never sends your medical records to any server.", icon: Zap, color: "bg-amber-50 text-amber-600" }
          ].map((f, i) => (
            <Card key={i} className="rounded-[2rem] border-muted/50 hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-8">
                <div className={`h-14 w-14 rounded-2xl ${f.color} flex items-center justify-center mb-6`}>
                  <f.icon className="h-7 w-7" />
                </div>
                <h3 className="font-bold text-xl mb-3">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-10 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold">Market Dashboard</h1>
          <p className="text-muted-foreground">Managing your healthcare expenses and market risks locally.</p>
        </div>
        <div className="flex gap-4">
          <Button asChild variant="outline" className="rounded-xl px-6 h-12"><Link to="/history"><History className="mr-2 h-4 w-4" /> History</Link></Button>
          <Button asChild className="rounded-xl px-8 h-12 shadow-lg shadow-primary/20"><Link to="/audit">New Audit</Link></Button>
        </div>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-3xl bg-primary text-primary-foreground border-none shadow-xl shadow-primary/10">
          <CardContent className="pt-8">
            <p className="text-xs font-bold opacity-70 uppercase tracking-widest">Est. Potential Recovery</p>
            <p className="text-4xl font-bold mt-2">${(stats.flaggedAmt * 0.2).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-muted/50 shadow-sm">
          <CardContent className="pt-8">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Flagged Billing</p>
            <p className="text-4xl font-bold mt-2 text-red-500">${stats.flaggedAmt.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-muted/50 shadow-sm">
          <CardContent className="pt-8">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Avg Rate Hike (Indexed)</p>
            <p className="text-4xl font-bold mt-2 text-foreground">{stats.avgHike}</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-muted/50 shadow-sm">
          <CardContent className="pt-8">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Plans Monitored</p>
            <p className="text-4xl font-bold mt-2 text-foreground">{filings.length}</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="rounded-[2rem] overflow-hidden border-muted/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Platform Health Overview</CardTitle>
            <CardDescription>Issue distribution across billing and insurance audits</CardDescription>
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
                <p>No systemic risks identified.</p>
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
              We've identified {filings.length} filings in the PA market. Use our monitor to ensure your upcoming premiums match state-approved hikes.
            </p>
            <Button asChild variant="secondary" className="rounded-xl px-8 h-12 font-bold">
              <Link to="/insurance-audit">Access Pipeline <TrendingUp className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}