import React, { useState } from 'react';
import { Search, Book } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GLOSSARY_TERMS } from '@/data/constants';
export function GlossaryPage() {
  const [search, setSearch] = useState('');
  const filteredTerms = GLOSSARY_TERMS.filter(item => 
    item.term.toLowerCase().includes(search.toLowerCase()) || 
    item.definition.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Billing Glossary</h1>
        <p className="text-muted-foreground max-w-2xl">
          Decoding the jargon used in medical bills. Understanding these terms is the first step in identifying errors and overcharges.
        </p>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search terms or definitions..." 
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
            No terms found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}