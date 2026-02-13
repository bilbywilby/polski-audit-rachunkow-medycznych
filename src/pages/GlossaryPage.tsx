import React, { useState } from 'react';
import { Search, Book } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GLOSSARY_TERMS } from '@/data/constants';
import { useLanguage } from '@/hooks/use-language';
export function GlossaryPage() {
  const [search, setSearch] = useState('');
  const { language } = useLanguage();
  const terms = language === 'pl' ? GLOSSARY_TERMS.pl : GLOSSARY_TERMS.en;
  const filteredTerms = terms.filter(item =>
    item.term.toLowerCase().includes(search.toLowerCase()) ||
    item.definition.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">
          {language === 'pl' ? 'Glosariusz Medyczny' : 'Billing Glossary'}
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          {language === 'pl' 
            ? 'Zrozumienie terminologii stosowanej w rozliczeniach NFZ i prywatnych placówkach to pierwszy krok do wykrycia błędów.' 
            : 'Decoding the jargon used in medical bills.'}
        </p>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={language === 'pl' ? 'Szukaj pojęć...' : 'Search terms...'}
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTerms.length > 0 ? (
          filteredTerms.map((item) => (
            <Card key={item.term} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Book className="h-4 w-4 text-primary" />
                  {item.term}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.definition}
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            {language === 'pl' ? 'Nie znaleziono pasujących pojęć.' : 'No terms found.'}
          </div>
        )}
      </div>
    </div>
  );
}