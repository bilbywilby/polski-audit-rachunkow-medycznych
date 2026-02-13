import React, { useState } from 'react';
import { Search, Book } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GLOSSARY_TERMS } from '@/data/constants';
export function GlossaryPage() {
  const [search, setSearch] = useState('');
  const terms = GLOSSARY_TERMS.en;
  const filtered = terms.filter(t => t.term.toLowerCase().includes(search.toLowerCase()) || t.definition.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-display font-bold">Medical Billing Glossary</h1>
        <p className="text-muted-foreground max-w-2xl">Master the complex jargon of healthcare billing to identify errors and fight upcoding.</p>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search 25+ terms..." className="pl-10 h-12 rounded-xl" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(t => (
          <Card key={t.term} className="hover:shadow-md transition-shadow rounded-2xl">
            <CardHeader className="pb-2"><CardTitle className="text-lg flex items-center gap-2"><Book className="h-4 w-4 text-primary" /> {t.term}</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground leading-relaxed">{t.definition}</p></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}