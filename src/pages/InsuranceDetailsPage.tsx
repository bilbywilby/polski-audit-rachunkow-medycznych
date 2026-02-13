import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getFilingById, InsuranceFilingRecord } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  TrendingUp, 
  Map as MapIcon, 
  Gavel, 
  ShieldCheck, 
  Info, 
  AlertCircle,
  FileText
} from 'lucide-react';
export function InsuranceDetailsPage() {
  const { id } = useParams();
  const [filing, setFiling] = useState<InsuranceFilingRecord | null>(null);
  useEffect(() => {
    if (id) getFilingById(id).then(setFiling);
  }, [id]);
  if (!filing) return <div className="py-20 text-center text-muted-foreground animate-pulse">Loading SERFF filing details...</div>;
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12 space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="space-y-3">
            <Button variant="ghost" asChild className="-ml-4 h-8 px-2 text-muted-foreground hover:text-foreground">
              <Link to="/insurance-audit"><ArrowLeft className="h-4 w-4 mr-2" /> Pipeline</Link>
            </Button>
            <h1 className="text-4xl font-display font-bold tracking-tight">{filing.extractedData.companyName}</h1>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="rounded-lg">Year: {filing.extractedData.planYear}</Badge>
              <Badge className="bg-primary text-primary-foreground rounded-lg">{filing.fileType}</Badge>
              <Badge variant={filing.status === 'flagged' ? 'destructive' : 'secondary'} className="rounded-lg font-bold">
                {filing.status.toUpperCase()}
              </Badge>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-xl h-12" asChild>
              <a href="https://filingaccess.serff.com/sfa/home/pa" target="_blank" rel="noreferrer">
                Verify on SERFF
              </a>
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="rounded-2xl border-none bg-blue-600 text-white shadow-lg">
                <CardContent className="pt-6">
                  <p className="text-xs font-bold uppercase opacity-80">Requested Hike</p>
                  <p className="text-3xl font-bold mt-1">{filing.extractedData.avgRateHike}</p>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-none bg-indigo-600 text-white shadow-lg">
                <CardContent className="pt-6">
                  <p className="text-xs font-bold uppercase opacity-80">Medical Loss Ratio</p>
                  <p className="text-3xl font-bold mt-1">{filing.extractedData.mlrPercent}</p>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-none bg-slate-800 text-white shadow-lg">
                <CardContent className="pt-6">
                  <p className="text-xs font-bold uppercase opacity-80">Actuarial Value</p>
                  <p className="text-3xl font-bold mt-1">{filing.extractedData.avLevel}</p>
                </CardContent>
              </Card>
            </div>
            <Tabs defaultValue="analysis" className="w-full">
              <TabsList className="bg-muted p-1 rounded-xl mb-6">
                <TabsTrigger value="analysis" className="rounded-lg">Rate Analysis</TabsTrigger>
                <TabsTrigger value="counties" className="rounded-lg">County Map</TabsTrigger>
                <TabsTrigger value="compliance" className="rounded-lg">Statutory Review</TabsTrigger>
              </TabsList>
              <TabsContent value="analysis" className="space-y-6">
                <Card className="rounded-2xl p-6 space-y-4 border-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h3 className="font-bold text-lg">Hike Comparison</h3>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    This requested hike of <span className="text-foreground font-bold">{filing.extractedData.avgRateHike}</span> is 
                    {parseFloat(filing.extractedData.avgRateHike || '0') > 7.4 ? ' above ' : ' below '} 
                    the Pennsylvania average (7.4%) for the upcoming plan year.
                  </p>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500" 
                      style={{ width: `${Math.min(100, (parseFloat(filing.extractedData.avgRateHike || '0') / 20) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground">
                    <span>0%</span>
                    <span>PA AVG (7.4%)</span>
                    <span>THRESHOLD (15%)</span>
                  </div>
                </Card>
              </TabsContent>
              <TabsContent value="counties" className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filing.extractedData.countyPricing ? (
                    Object.entries(filing.extractedData.countyPricing).map(([county, price]) => (
                      <Card key={county} className="p-4 flex justify-between items-center rounded-xl border-muted/50">
                        <div className="flex items-center gap-2">
                          <MapIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{county}</span>
                        </div>
                        <span className="font-bold">${price.toFixed(2)}</span>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-2 py-12 text-center text-muted-foreground italic border-2 border-dashed rounded-3xl">
                      No regional pricing table detected in this filing.
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="compliance" className="space-y-6">
                {filing.reviewPoints?.map((point, idx) => (
                  <Card key={idx} className="rounded-2xl border-amber-200 bg-amber-50/30">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-amber-600" />
                        <CardTitle className="text-lg">{point.description}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start gap-3 p-3 bg-white/60 rounded-xl border border-amber-100">
                        <Gavel className="h-4 w-4 text-amber-700 mt-1" />
                        <div>
                          <p className="text-xs font-bold text-amber-900 uppercase">Statutory Basis</p>
                          <p className="text-sm text-amber-800 font-medium">{point.taxonomy?.statute_ref}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {(!filing.reviewPoints || filing.reviewPoints.length === 0) && (
                  <div className="py-20 text-center text-muted-foreground italic border-2 border-dashed rounded-3xl">
                    No statutory violations detected. Rate hike falls within standard ranges.
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
          <div className="space-y-6">
            <Card className="rounded-3xl border-muted/50 shadow-sm">
              <CardHeader><CardTitle className="text-lg">Filing Metadata</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Tracking #', value: filing.id.substring(0, 13).toUpperCase(), icon: FileText },
                  { label: 'Carrier', value: filing.extractedData.companyName, icon: ShieldCheck },
                  { label: 'Submission', value: new Date(filing.date).toLocaleDateString(), icon: Info }
                ].map((m, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/20">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <m.icon className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase">{m.label}</span>
                    </div>
                    <span className="text-sm font-bold text-foreground">{m.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <div className="bg-primary/5 border border-primary/10 rounded-3xl p-6 space-y-4">
              <h3 className="font-bold flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                PID Transparency
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Under PA Title 40 P.S. § 710.1, the Insurance Commissioner must review health rates to ensure they are not excessive, inadequate, or unfairly discriminatory.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}