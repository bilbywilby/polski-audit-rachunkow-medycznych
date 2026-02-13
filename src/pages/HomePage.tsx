import React, { useEffect, useState, useMemo } from 'react';
import { Shield, FileSearch, ArrowRight, History, Zap, CheckCircle, Info, Gavel } from 'lucide-react';
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
  ResponsiveContainer
} from 'recharts';
export function HomePage() {
  const [audits, setAudits] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();
  useEffect(() => {
    async function loadData() {
      try {
        const data = await getAllAudits();
        setAudits(data);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);
  const stats = useMemo(() => {
    const totalValue = audits.reduce((s, a) => s + a.totalAmount, 0);
    const flaggedAudits = audits.filter(a => a.status === 'flagged');
    const flaggedAmount = flaggedAudits.reduce((s, a) => s + a.totalAmount, 0);
    const savingsPotential = flaggedAudits.reduce((s, a) => s + (a.totalAmount * 0.25), 0); 
    return {
      totalValue,
      flaggedCount: flaggedAudits.length,
      flaggedAmount,
      savingsPotential,
      hasAudits: audits.length > 0
    };
  }, [audits]);
  const chartData = useMemo(() => {
    return audits.slice(0, 5).reverse().map(a => ({
      name: a.fileName.length > 10 ? a.fileName.substring(0, 8) + '...' : a.fileName,
      amount: a.totalAmount
    }));
  }, [audits]);
  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Zap className="h-10 w-10 text-primary animate-pulse" />
      </div>
    );
  }
  if (!stats.hasAudits) {
    return (
      <div className="max-w-4xl mx-auto space-y-16 py-12 animate-fade-in">
        <section className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
            <Shield className="h-4 w-4" />
            <span>{t('home.title')}</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight tracking-tight text-foreground">
            {language === 'pl' ? 'Audytuj faktury' : "Don't pay a bill"} <br />
            <span className="text-primary italic">{language === 'pl' ? 'zanim zapłacisz.' : 'until you audit it.'}</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {language === 'pl' 
              ? 'BillGuard PA automatycznie wykrywa błędy w rozliczeniach medycznych, zawyżone kody procedur oraz nielegalną redakcję danych.' 
              : 'BillGuard PA automatically detects medical billing errors and overcharged codes.'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button asChild size="lg" className="rounded-2xl h-14 px-8 text-lg font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-all">
              <Link to="/audit">
                <FileSearch className="mr-2 h-5 w-5" />
                {language === 'pl' ? 'Rozpocznij Audyt' : 'Audit First Bill'}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-2xl h-14 px-8 text-lg border-primary/20">
              <Link to="/glossary">{language === 'pl' ? 'Poznaj Terminologię' : 'Learn Jargon'}</Link>
            </Button>
          </div>
        </section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "RODO & PESEL", desc: "Automatyczna redakcja numeru PESEL i danych wrażliwych lokalnie.", icon: Shield },
            { title: "Zgodność z NFZ", desc: "Weryfikacja stawek względem publicznych cenników świadczeń.", icon: Gavel },
            { title: "Szybkie Szablony", desc: "Generowanie pism do szpitali i NFZ w języku polskim.", icon: Zap }
          ].map((feature, i) => (
            <Card key={i} className="rounded-3xl border-muted shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
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
        <div className="space-y-2">
          <h1 className="text-4xl font-display font-bold">{language === 'pl' ? 'Witaj ponownie' : 'Welcome back'}</h1>
          <p className="text-muted-foreground text-lg">
            {language === 'pl' ? `Sprawdzono ${audits.length} faktur o wartości` : `Audited ${audits.length} bills worth`} {stats.totalValue.toLocaleString()} {language === 'pl' ? 'PLN' : 'USD'}.
          </p>
        </div>
        <Button asChild size="lg" className="rounded-2xl shadow-lg shadow-primary/20 px-8">
          <Link to="/audit"><FileSearch className="mr-2 h-5 w-5" /> {language === 'pl' ? 'Nowy Audyt' : 'New Audit'}</Link>
        </Button>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-3xl bg-primary text-primary-foreground border-none shadow-xl">
          <CardContent className="pt-6">
            <p className="text-sm font-medium opacity-80 uppercase tracking-widest">{t('home.savings')}</p>
            <p className="text-4xl font-bold mt-2">{stats.savingsPotential.toLocaleString()} {language === 'pl' ? 'PLN' : '$'}</p>
            <p className="text-xs mt-4 flex items-center gap-1 opacity-70">
              <CheckCircle className="h-3 w-3" /> {language === 'pl' ? 'Szacunkowa oszcz��dność' : 'Typical dispute outcome'}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-muted/50 shadow-sm">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">{t('home.flagged')}</p>
            <p className="text-4xl font-bold mt-2 text-foreground">{stats.flaggedAmount.toLocaleString()} {language === 'pl' ? 'PLN' : '$'}</p>
            <p className="text-xs mt-4 flex items-center gap-1 text-amber-600 font-medium">
              <Info className="h-3 w-3" /> {stats.flaggedCount} {language === 'pl' ? 'wymaga uwagi' : 'need attention'}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-muted/50 shadow-sm">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">{t('home.total')}</p>
            <p className="text-4xl font-bold mt-2 text-foreground">{stats.totalValue.toLocaleString()} {language === 'pl' ? 'PLN' : '$'}</p>
            <p className="text-xs mt-4 flex items-center gap-1 text-muted-foreground">
              <History className="h-3 w-3" /> {language === 'pl' ? 'Ostatni:' : 'Latest:'} {audits[0]?.fileName.substring(0, 15)}...
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="rounded-3xl border-muted/50 shadow-sm overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">{language === 'pl' ? 'Historia Audytów' : 'Audit History'}</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] pr-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-muted/50 shadow-sm flex flex-col justify-center items-center text-center p-10 bg-primary/5">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Zap className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-2xl font-bold mb-3">{language === 'pl' ? 'Gotowy do działania?' : 'Ready to dispute?'}</h3>
          <p className="text-muted-foreground mb-8 max-w-sm">
            {language === 'pl' ? 'Skorzystaj z gotowych pism do szpitali i NFZ opartych o Twoje wyniki.' : 'Use professional templates pre-filled with findings.'}
          </p>
          <Button asChild className="rounded-xl w-full max-w-xs h-12 text-lg font-bold">
            <Link to="/letters">{t('nav.letters')} <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </Card>
      </div>
    </div>
  );
}