import React, { useEffect, useState, useMemo } from 'react';
import { Shield, FileSearch, ArrowRight, History, Zap, CheckCircle, Info, Gavel, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { getAllAudits, AuditRecord } from '@/lib/db';
import { useLanguage } from '@/hooks/use-language';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
export function HomePage() {
  const [audits, setAudits] = useState<AuditRecord[]>([]);
  const { t } = useLanguage();
  useEffect(() => {
    getAllAudits().then(setAudits);
  }, []);
  const stats = useMemo(() => {
    const total = audits.reduce((s, a) => s + a.totalAmount, 0);
    const flagged = audits.filter(a => a.status === 'flagged');
    const flaggedAmt = flagged.reduce((s, a) => s + a.totalAmount, 0);
    return { total, flaggedCount: flagged.length, flaggedAmt, hasAudits: audits.length > 0 };
  }, [audits]);
  const chartData = useMemo(() => {
    return audits.slice(0, 5).reverse().map(a => ({
      name: a.fileName.length > 12 ? a.fileName.substring(0, 10) + '...' : a.fileName,
      amount: a.totalAmount
    }));
  }, [audits]);
  const distributionData = useMemo(() => {
    const counts: Record<string, number> = {};
    audits.forEach(a => {
      a.flags.forEach(f => {
        const type = f.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        counts[type] = (counts[type] || 0) + 1;
      });
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [audits]);
  const COLORS = ['#2563EB', '#6366F1', '#F59E0B', '#EF4444', '#10B981'];
  if (!stats.hasAudits) {
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
            Audit your Pennsylvania medical statements against <strong>Act 102</strong> and the <strong>No Surprises Act</strong>. 
            Identify upcoding and balance billing in seconds.
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-6">
            <Button asChild size="lg" className="rounded-2xl h-16 px-10 text-lg font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
              <Link to="/audit"><FileSearch className="mr-3 h-6 w-6" /> Start New Audit</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-2xl h-16 px-10 text-lg border-2">
              <Link to="/resources">Your Rights</Link>
            </Button>
          </div>
        </section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "No Surprises Act", desc: "Automatic checks for out-of-network rates in emergency settings across PA.", icon: Shield, color: "bg-blue-50 text-blue-600" },
            { title: "PA Act 102 Rights", desc: "Pennsylvania law gives you the right to an itemized bill within 30 days.", icon: Gavel, color: "bg-indigo-50 text-indigo-600" },
            { title: "HIPAA-Friendly", desc: "Private analysis that never sends your medical records to any server.", icon: Zap, color: "bg-amber-50 text-amber-600" }
          ].map((f, i) => (
            <Card key={i} className="rounded-[2rem] border-muted/50 hover:shadow-xl transition-all duration-300 group">
              <CardContent className="pt-8">
                <div className={`h-14 w-14 rounded-2xl ${f.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
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
          <h1 className="text-4xl font-display font-bold">Billing Dashboard</h1>
          <p className="text-muted-foreground">Managing {audits.length} local audit records securely.</p>
        </div>
        <div className="flex gap-4">
          <Button asChild variant="outline" className="rounded-xl px-6 h-12"><Link to="/history"><History className="mr-2 h-4 w-4" /> View History</Link></Button>
          <Button asChild className="rounded-xl px-8 h-12 shadow-lg shadow-primary/20"><Link to="/audit">New Audit</Link></Button>
        </div>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-3xl bg-primary text-primary-foreground border-none shadow-xl shadow-primary/10">
          <CardContent className="pt-8">
            <p className="text-sm font-bold opacity-70 uppercase tracking-widest">{t('home.savings')}</p>
            <p className="text-5xl font-bold mt-2">${(stats.flaggedAmt * 0.25).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            <p className="text-xs mt-6 opacity-80 flex items-center gap-2 bg-white/10 w-fit px-3 py-1 rounded-full">
              <CheckCircle className="h-3 w-3" /> Potential recovery estimate
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-muted/50 shadow-sm">
          <CardContent className="pt-8">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{t('home.flagged')}</p>
            <p className="text-5xl font-bold mt-2 text-foreground">${stats.flaggedAmt.toLocaleString()}</p>
            <p className="text-xs mt-6 text-red-600 font-bold flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> {stats.flaggedCount} identified violations
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-muted/50 shadow-sm">
          <CardContent className="pt-8">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{t('home.total')}</p>
            <p className="text-5xl font-bold mt-2 text-foreground">${stats.total.toLocaleString()}</p>
            <p className="text-xs mt-6 text-muted-foreground font-medium flex items-center gap-2">
              <History className="h-4 w-4" /> Combined bill history
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="rounded-[2rem] overflow-hidden border-muted/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Billed Amount Trends</CardTitle>
            <CardDescription>Visualizing your last 5 scanned medical statements</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }} 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} 
                />
                <Bar dataKey="amount" fill="#2563EB" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="rounded-[2rem] overflow-hidden border-muted/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Detected Violations</CardTitle>
            <CardDescription>Categories of errors found across your audits</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] mt-4">
            {distributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    innerRadius={65}
                    outerRadius={90}
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
                <p>No issues detected across scanned bills.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}