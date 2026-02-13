import React, { useEffect, useState, useMemo } from 'react';
import { Shield, FileSearch, ArrowRight, History, Zap, CheckCircle, Info, Gavel } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { getAllAudits, AuditRecord } from '@/lib/db';
import { useLanguage } from '@/hooks/use-language';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
      name: a.fileName.substring(0, 10),
      amount: a.totalAmount
    }));
  }, [audits]);
  if (!stats.hasAudits) {
    return (
      <div className="max-w-4xl mx-auto space-y-16 py-12">
        <section className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Shield className="h-4 w-4" /> <span>Pennsylvania Healthcare Defense</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground">
            Don't pay a bill <br /><span className="text-primary italic">until you audit it.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Detect balance billing violations, upcoded procedures, and exercise your PA Act 102 rights instantly.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button asChild size="lg" className="rounded-2xl h-14 px-8 text-lg font-bold">
              <Link to="/audit"><FileSearch className="mr-2 h-5 w-5" /> Audit First Bill</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-2xl h-14 px-8 text-lg">
              <Link to="/resources">Learn Rights</Link>
            </Button>
          </div>
        </section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "No Surprises Act", desc: "Federal protection from out-of-network emergency rates.", icon: Shield },
            { title: "PA Act 102", desc: "Your state right to an itemized hospital bill within 30 days.", icon: Gavel },
            { title: "Local Privacy", desc: "HIPAA-friendly analysis that stays on your device.", icon: Zap }
          ].map((f, i) => (
            <Card key={i} className="rounded-3xl hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4"><f.icon className="h-6 w-6 text-primary" /></div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-display font-bold">Health Dashboard</h1>
          <p className="text-muted-foreground">{audits.length} local records analyzed.</p>
        </div>
        <Button asChild className="rounded-2xl px-8 h-12"><Link to="/audit">New Audit</Link></Button>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-3xl bg-primary text-primary-foreground border-none">
          <CardContent className="pt-6">
            <p className="text-sm font-medium opacity-80 uppercase">{t('home.savings')}</p>
            <p className="text-4xl font-bold mt-2">${(stats.flaggedAmt * 0.2).toLocaleString()}</p>
            <p className="text-xs mt-4 opacity-70 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Based on regional averages</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-muted/50">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground uppercase">{t('home.flagged')}</p>
            <p className="text-4xl font-bold mt-2">${stats.flaggedAmt.toLocaleString()}</p>
            <p className="text-xs mt-4 text-amber-600 font-medium flex items-center gap-1"><Info className="h-3 w-3" /> {stats.flaggedCount} issues found</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-muted/50">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground uppercase">{t('home.total')}</p>
            <p className="text-4xl font-bold mt-2">${stats.total.toLocaleString()}</p>
            <p className="text-xs mt-4 text-muted-foreground flex items-center gap-1"><History className="h-3 w-3" /> Lifetime total</p>
          </CardContent>
        </Card>
      </div>
      <Card className="rounded-3xl overflow-hidden h-[350px]">
        <CardHeader><CardTitle>Spending Trend</CardTitle></CardHeader>
        <CardContent className="h-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
              <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
              <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}