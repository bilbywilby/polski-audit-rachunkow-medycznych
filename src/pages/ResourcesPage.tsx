import React from 'react';
import { Landmark, ExternalLink, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PA_RESOURCES } from '@/data/constants';
import { useLanguage } from '@/hooks/use-language';
export function ResourcesPage() {
  const { language } = useLanguage();
  const resources = language === 'pl' ? PA_RESOURCES.pl : PA_RESOURCES.en;
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">
          {language === 'pl' ? 'Zasoby i Instytucje' : 'State Resources'}
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          {language === 'pl' 
            ? 'Oficjalne polskie organy i organizacje pomagające pacjentom w sporach o koszty leczenia i ubezpieczenie.' 
            : 'Official agencies that can help you with medical debt.'}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {resources.map((resource) => (
          <Card key={resource.name} className="flex flex-col h-full border-l-4 border-l-primary">
            <CardHeader>
              <div className="flex justify-between items-start">
                <Landmark className="h-8 w-8 text-primary mb-2" />
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                  <ExternalLink className="h-5 w-5 text-muted-foreground" />
                </a>
              </div>
              <CardTitle className="text-xl">{resource.name}</CardTitle>
              <CardDescription>{resource.description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto pt-4 border-t border-dashed">
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-semibold text-sm hover:underline flex items-center gap-1"
              >
                {language === 'pl' ? 'Odwiedź stronę' : 'Visit Website'} <ExternalLink className="h-3 w-3" />
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6 flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg mb-1">
              {language === 'pl' ? 'Ustawa o prawach pacjenta' : 'Patient Rights Act'}
            </h3>
            <p className="text-muted-foreground text-sm">
              {language === 'pl' 
                ? 'Polskie prawo gwarantuje pacjentowi wgląd do pełnej dokumentacji medycznej oraz przejrzystość kosztów leczenia. Jeśli jesteś nieubezpieczony, masz prawo do starania się o pomoc socjalną w ramach programów gminnych.' 
                : 'Polish law guarantees access to medical records and cost transparency.'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}