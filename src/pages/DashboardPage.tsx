import React, { useEffect, useState, useMemo } from 'react';
import { ShieldAlert, FileSearch, ArrowRight, Gavel, Scale, TrendingDown, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { getAllAudits, AuditRecord } from '@/lib/db';
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
export function DashboardPage() {
  const [audits, setAudits] = useState<AuditRecord[]>([]);
  useEffect(() => {
    async function loadData() {
      const data = await getAllAudits();
      setAudits(data);
    }
    loadData();
  }, []);
  const stats = useMemo(() => {
    const totalValue = audits.reduce((s, a) => s + a.totalAmount, 0);
    const riskyAudits = audits.filter(a => a.status !== 'clean');
    const flaggedAmount = riskyAudits.reduce((s, a) => s + a.totalAmount, 0);
    return { totalValue, riskyCount: riskyAudits.length, flaggedAmount };
  }, [audits]);
  const barData = useMemo(() => {
    return audits.slice(0, 5).reverse().map(a => ({
      name: a.fileName.substring(0, 10),
      amount: a.totalAmount
    }));
  }, [audits]);
  const pieData = useMemo(() => {
    const counts: Record<string, number> = {};
    audits.forEach(a => {
      a.reviewPoints?.forEach(f => {
        counts[f.type] = (counts[f.type] || 0) + 1;
      });
    });
    return Object.entries(counts).map(([name, value]) => ({ name: name.replace(/-/g, ' '), value }));
  }, [audits]);
  const COLORS = ['#2563EB', '#F59E0B', '#EF4444', '#10B981', '#8B5CF6'];
  return (
    <div className="space-y-10 animate-fade-in">
      <section className="bg-primary/5 rounded-[2.5rem] p-10 border border-primary/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <TrendingDown className="h-64 w-64 -mr-20 -mt-20" />
        </div>
        <div className="max-w-4xl relative z-10">
          <h1 className="text-5xl font-display font-bold text-foreground mb-6 leading-tight">
            Protect your wealth from <br /><span className="text-primary">Medical Billing Errors</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl">
            You have scanned <strong>${stats.totalValue.toLocaleString()}</strong> in medical bills. 
            We found potential errors in <strong>{stats.riskyCount}</strong> files totaling 
            <strong> ${stats.flaggedAmount.toLocaleString()}</strong>.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg" className="rounded-2xl px-8 h-14 text-lg font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
              <Link to="/audit">
                <FileSearch className="mr-2 h-5 w-5" />
                Start New Audit
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-2xl px-8 h-14 text-lg border-primary/20">
              <Link to="/history">
                View Past Audits
              </Link>
            </Button>
          </div>
        </div>
      </section>
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-3">
        <div className="bg-amber-500 p-2 rounded-lg">
          <Info className="h-5 w-5 text-white" />
        </div>
        <p className="text-sm font-medium text-amber-900 dark:text-amber-400">
          <span className="font-bold">PA Alert:</span> The "No Surprises Act" now protects you from out-of-network rates in emergency departments across Pennsylvania.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="rounded-3xl border-muted/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Billing Trends</CardTitle>
            <CardDescription>Amount billed across your last 5 audits</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="amount" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-muted/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Issue Distribution</CardTitle>
            <CardDescription>Frequency of different review points detected</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground italic">
                Scan more bills to see distribution data
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="shadow-sm border-muted/50 hover:border-primary/30 transition-all rounded-3xl">
          <CardHeader>
            <div className="h-12 w-12 rounded-2xl bg-amber-100 flex items-center justify-center mb-2">
              <ShieldAlert className="h-6 w-6 text-amber-600" />
            </div>
            <CardTitle className="text-lg">No Surprises Act</CardTitle>
            <CardDescription>Pennsylvania Rights</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Hospitals in PA cannot charge you out-of-network rates for emergency services. This is federal law with state enforcement.
            </p>
            <Link to="/resources" className="text-sm font-bold text-primary inline-flex items-center hover:underline">
              View PA Protections <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-muted/50 hover:border-primary/30 transition-all rounded-3xl">
          <CardHeader>
            <div className="h-12 w-12 rounded-2xl bg-blue-100 flex items-center justify-center mb-2">
              <Gavel className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-lg">Dispute Support</CardTitle>
            <CardDescription>Legal Aid Directory</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Connect with PA Health Law Project and other legal services if your audit shows violations.
            </p>
            <Link to="/resources" className="text-sm font-bold text-primary inline-flex items-center hover:underline">
              Access Resources <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-muted/50 hover:border-primary/30 transition-all rounded-3xl">
          <CardHeader>
            <div className="h-12 w-12 rounded-2xl bg-indigo-100 flex items-center justify-center mb-2">
              <Scale className="h-6 w-6 text-indigo-600" />
            </div>
            <CardTitle className="text-lg">Knowledge Base</CardTitle>
            <CardDescription>Billing Glossary</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Decode the complex jargon used in your medical statements to identify intentional upcoding.
            </p>
            <Link to="/glossary" className="text-sm font-bold text-primary inline-flex items-center hover:underline">
              Explore Glossary <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}