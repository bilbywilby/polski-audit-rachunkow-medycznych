import React from 'react';
import { Landmark, ExternalLink, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PA_RESOURCES } from '@/data/constants';
export function ResourcesPage() {
  const resources = PA_RESOURCES.en;
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-display font-bold">PA State Resources</h1>
        <p className="text-muted-foreground max-w-2xl">Official Pennsylvania agencies and legal aid groups for fighting unfair medical bills.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {resources.map(r => (
          <Card key={r.name} className="flex flex-col border-l-4 border-l-primary rounded-2xl">
            <CardHeader>
              <div className="flex justify-between items-start">
                <Landmark className="h-8 w-8 text-primary mb-2" />
                <a href={r.url} target="_blank" rel="noreferrer" className="p-2 hover:bg-muted rounded-full"><ExternalLink className="h-5 w-5" /></a>
              </div>
              <CardTitle className="text-xl">{r.name}</CardTitle>
              <CardDescription>{r.description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto pt-4 border-t border-dashed">
              <a href={r.url} target="_blank" rel="noreferrer" className="text-primary font-bold text-sm hover:underline flex items-center gap-1">Visit Website <ExternalLink className="h-3 w-3" /></a>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="bg-primary/5 border-primary/20 rounded-3xl p-8">
        <div className="flex items-start gap-6">
          <div className="p-4 bg-primary/10 rounded-2xl"><ShieldCheck className="h-8 w-8 text-primary" /></div>
          <div className="space-y-4">
            <h3 className="font-bold text-2xl">Your Rights in Pennsylvania</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <p className="font-bold text-primary">No Surprises Act (Federal)</p>
                <p className="text-sm text-muted-foreground">Protects you from out-of-network balance billing in emergency settings and when receiving non-emergency care at in-network facilities.</p>
              </div>
              <div className="space-y-2">
                <p className="font-bold text-primary">PA Act 102 (State)</p>
                <p className="text-sm text-muted-foreground">Pennsylvania state law requiring all hospitals to provide patients with an itemized bill within 30 days of service upon request.</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}