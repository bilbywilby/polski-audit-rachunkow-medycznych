import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  TrendingUp,
  FilePlus,
  Search,
  Filter,
  ChevronRight,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Globe,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { getAllFilings, InsuranceFilingRecord, saveFiling } from '@/lib/db';
import { useLanguage } from '@/hooks/use-language';
import { analyzeInsuranceFiling, extractTextFromFiling } from '@/lib/insurance-engine';
export function InsuranceAuditPage() {
  const { t } = useLanguage();
  const [filings, setFilings] = useState<InsuranceFilingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const loadFilings = useCallback(async () => {
    try {
      const data = await getAllFilings();
      setFilings(data);
    } catch (error) {
      toast.error('Failed to load filing records');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    loadFilings();
  }, [loadFilings]);
  const stats = useMemo(() => {
    if (filings.length === 0) return { avgHike: '0%', anomalies: 0 };
    const validHikes = filings
      .map(f => parseFloat(f.extractedData.avgRateHike?.replace('%', '') || '0'))
      .filter(h => h > 0);
    const avg = validHikes.length > 0 ? (validHikes.reduce((a, b) => a + b, 0) / validHikes.length).toFixed(1) : '0';
    const anomalies = filings.filter(f => f.status === 'flagged').length;
    return { avgHike: `${avg}%`, anomalies };
  }, [filings]);
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setAnalyzing(true);
    try {
      const text = await extractTextFromFiling(file);
      const analysis = await analyzeInsuranceFiling(text, file.name);
      await saveFiling(analysis);
      setFilings(prev => [analysis, ...prev]);
      toast.success('Filing Analyzed', { description: 'Document successfully indexed in local repository.' });
    } catch (error) {
      console.error(error);
      toast.error('Analysis failed', { description: 'Could not parse the insurance filing.' });
    } finally {
      setAnalyzing(false);
    }
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 
      'application/pdf': ['.pdf'], 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] 
    },
    multiple: false
  });
  const filteredFilings = filings.filter(f =>
    f.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.extractedData.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12 space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-display font-bold">{t('nav.insurancerates')}</h1>
            <p className="text-muted-foreground text-lg">{t('insurance.subtitle')}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild className="rounded-xl h-11">
              <a href="https://filingaccess.serff.com/sfa/home/pa" target="_blank" rel="noreferrer">
                <Globe className="mr-2 h-4 w-4" /> Open SERFF
              </a>
            </Button>
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <Button disabled={analyzing} className="rounded-xl h-11 px-6 shadow-lg shadow-primary/10">
                {analyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FilePlus className="mr-2 h-4 w-4" />}
                {analyzing ? 'Analyzing...' : t('insurance.upload')}
              </Button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="rounded-2xl border-none bg-primary text-primary-foreground shadow-xl shadow-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold opacity-80 uppercase tracking-wider">Average Rate Hike</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold flex items-baseline gap-2">
                {stats.avgHike} <TrendingUp className="h-5 w-5 text-green-400" />
              </div>
              <p className="text-xs opacity-70 mt-4 italic">PA index based on indexed filings</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-muted/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Plans Analyzed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{filings.length}</div>
              <p className="text-xs text-muted-foreground mt-4 italic">Locally stored repository</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-muted/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Anomalies Detected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-4xl font-bold ${stats.anomalies > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {stats.anomalies}
              </div>
              <p className="text-xs text-muted-foreground mt-4 italic">Filings exceeding threshold</p>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search filings by carrier..."
                className="pl-10 h-11 rounded-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-2xl" />
              ))
            ) : filteredFilings.length > 0 ? (
              filteredFilings.map((filing) => (
                <Link key={filing.id} to={`/insurance-audit/${filing.id}`}>
                  <Card className="group hover:border-primary/50 transition-all rounded-2xl overflow-hidden border-muted/60 shadow-none">
                    <div className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                          <BarChart3 className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                        </div>
                        <div>
                          <h4 className="font-bold text-foreground truncate max-w-xs">{filing.extractedData.companyName}</h4>
                          <p className="text-xs text-muted-foreground flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] px-1.5 h-4 uppercase">{filing.fileType}</Badge>
                            <span>Year: {filing.extractedData.planYear}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Rate Impact</p>
                          <p className="font-bold text-sm">{filing.extractedData.avgRateHike}</p>
                        </div>
                        <Badge className={
                          filing.status === 'flagged' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }>
                          {filing.status === 'flagged' && <AlertCircle className="mr-1.5 h-3 w-3" />}
                          {filing.status === 'indexed' && <CheckCircle2 className="mr-1.5 h-3 w-3" />}
                          {filing.status.toUpperCase()}
                        </Badge>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="text-center py-20 border-2 border-dashed rounded-3xl bg-muted/5">
                <BarChart3 className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-lg font-bold">No filings found</p>
                <p className="text-sm text-muted-foreground">Upload your first SERFF or actuarial document to start.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}