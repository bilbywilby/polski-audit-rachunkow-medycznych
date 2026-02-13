import React from 'react';
interface PlaceholderPageProps {
  title: string;
  description?: string;
}
export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 text-center">
      <h2 className="text-3xl font-bold text-foreground mb-4">{title}</h2>
      <p className="text-muted-foreground max-w-md mx-auto">
        {description ?? `The ${title} functionality is scheduled for our next update. Stay tuned!`}
      </p>
    </div>
  );
}