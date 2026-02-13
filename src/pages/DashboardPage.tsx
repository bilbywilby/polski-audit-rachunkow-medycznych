import React from 'react';
import { ShieldAlert, FileSearch, ArrowRight, Gavel, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
export function DashboardPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <section className="bg-primary/5 rounded-3xl p-8 border border-primary/10">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-display font-bold text-foreground mb-4">
            Protect your wallet from <span className="text-primary">Medical Billing Errors</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
            Pennsylvania patients lose millions every year to overcharging, upcoding, and "surprise" bills. 
            BillGuard PA helps you audit your bills privately and fight back using state-specific protections.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link to="/audit">
                <FileSearch className="mr-2 h-5 w-5" />
                Start New Audit
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/glossary">
                Learn the Terms
              </Link>
            </Button>
          </div>
        </div>
      </section>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-soft border-border hover:border-primary/20 transition-colors">
          <CardHeader>
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center mb-2">
              <ShieldAlert className="h-5 w-5 text-amber-600" />
            </div>
            <CardTitle>No Surprises Act</CardTitle>
            <CardDescription>Pennsylvania Rights</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Since Jan 2022, hospitals in PA cannot charge you out-of-network rates for emergency services.
            </p>
            <Link to="/resources" className="text-sm font-medium text-primary inline-flex items-center hover:underline">
              View PA Protections <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-border">
          <CardHeader>
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mb-2">
              <Gavel className="h-5 w-5 text-blue-600" />
            </div>
            <CardTitle>Dispute Support</CardTitle>
            <CardDescription>Legal Help Links</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Connect with PA Health Law Project and other legal aid services if your audit shows violations.
            </p>
            <Link to="/resources" className="text-sm font-medium text-primary inline-flex items-center hover:underline">
              Access Resources <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-border">
          <CardHeader>
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mb-2">
              <Scale className="h-5 w-5 text-indigo-600" />
            </div>
            <CardTitle>Audit History</CardTitle>
            <CardDescription>Local & Private</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Your previous audits are stored locally on this device. No data ever leaves your browser.
            </p>
            <Link to="/history" className="text-sm font-medium text-primary inline-flex items-center hover:underline">
              View History <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}