"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, TrendingUp, ArrowRight, Mail } from "lucide-react";
import Link from "next/link";

const services = [
  {
    icon: <Building2 className="h-6 w-6 text-primary" />,
    title: "Business Structuring",
    description: "Get expert guidance on structuring your SME for growth, compliance, and investment readiness.",
    badge: "Popular",
  },
  {
    icon: <Users className="h-6 w-6 text-primary" />,
    title: "Digital Readiness Audit",
    description: "A comprehensive assessment of your digital capabilities with actionable recommendations.",
    badge: "New",
  },
  {
    icon: <TrendingUp className="h-6 w-6 text-primary" />,
    title: "Growth Strategy",
    description: "Develop a tailored growth plan leveraging AI insights and market data specific to Zimbabwe.",
    badge: null,
  },
];

export default function ConsultancyPage() {
  return (
    <div className="container max-w-5xl py-12 px-4 md:px-6">
      <div className="text-center mb-12">
        <Badge variant="secondary" className="mb-4">Professional Services</Badge>
        <h1 className="font-headline text-4xl font-bold mb-4">
          Expert Consultancy for Your SME
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Combine the power of AI with human expertise. Our consultancy services help
          Zimbabwean SMEs navigate compliance, structure for growth, and seize opportunities.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-12">
        {services.map((service) => (
          <Card key={service.title} className="relative overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                {service.icon}
                {service.badge && <Badge variant="secondary" className="text-xs">{service.badge}</Badge>}
              </div>
              <CardTitle className="text-lg">{service.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm leading-relaxed">
                {service.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center space-y-4">
        <h2 className="text-2xl font-semibold">Ready to Get Started?</h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Book a free 15-minute discovery call to discuss how we can help your business grow.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" asChild>
            <a href="mailto:consulting@radbitstudios.co.zw?subject=Consultancy%20Enquiry">
              <Mail className="mr-2 h-4 w-4" />
              Book Discovery Call
            </a>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/assessment">
              Take Free Assessment
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
