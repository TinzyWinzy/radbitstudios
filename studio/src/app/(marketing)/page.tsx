
"use client";

import { useEffect } from "react";
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart, Lightbulb, Users, Briefcase, TrendingUp, ClipboardCheck, Wrench } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { registerVisibilityHandler } from "@/lib/device";
import { AdUnit } from "@/components/adsense";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Autoplay from "embla-carousel-autoplay";


const howItWorksSteps = [
    {
        icon: <BarChart className="h-8 w-8 text-primary" />,
        title: "Assess",
        description: "Take the 15-question readiness test to get a baseline of your business's digital maturity.",
    },
    {
        icon: <Lightbulb className="h-8 w-8 text-primary" />,
        title: "Act",
        description: "Receive AI-driven insights and personalized recommendations to improve your weakest areas.",
    },
    {
        icon: <TrendingUp className="h-8 w-8 text-primary" />,
        title: "Grow",
        description: "Apply for tenders, network with peers, and track your progress on your dashboard.",
    },
];

const featureHighlights = [
    {
        icon: <BarChart className="h-8 w-8 text-primary" />,
        title: "Digital Readiness Assessment",
        description: "Get a 360-degree view of your business's strengths and weaknesses with our comprehensive assessment tool and see your results on a radar chart.",
        link: "/assessment",
        infoBites: ["Strengths", "Gaps", "Score"],
    },
    {
        icon: <Lightbulb className="h-8 w-8 text-primary" />,
        title: "AI Agent Workforce",
        description: "Deploy specialized AI agents to automate tasks like logo design, content creation, and more, directly from your dashboard.",
        link: "/agents",
        infoBites: ["Design", "Content", "Automation"],
    },
    {
        icon: <Briefcase className="h-8 w-8 text-primary" />,
        title: "Tender & News Hub",
        description: "Stay ahead of the curve with AI-curated tenders and news relevant to your industry. Never miss an opportunity again.",
        link: "/tenders",
        infoBites: ["Opportunities", "Alerts", "News"],
    },
    {
        icon: <Users className="h-8 w-8 text-primary" />,
        title: "SME Community Forum",
        description: "Connect with a network of fellow entrepreneurs. Ask questions, share insights, and collaborate on new ventures.",
        link: "/community",
        infoBites: ["Network", "Collaborate", "Support"],
    }
];

const testimonials = [
    {
        name: "Tafadzwa Moyo",
        role: "Founder, TafaFresh Foods",
        avatar: "https://picsum.photos/seed/zimbabwe-man/100/100",
        avatarHint: "zimbabwean man",
        story: "\"Radbit SME Hub gave me the tools I didn’t know I needed. The assessment showed me where to focus, and the AI toolkit helped me create a professional business profile that impressed investors. I went from feeling overwhelmed to empowered.\""
    },
    {
        name: "Rudo Dube",
        role: "Owner, Zim-Artisans",
        avatar: "https://picsum.photos/seed/zimbabwe-woman/100/100",
        avatarHint: "zimbabwean woman",
        story: "\"The community forum has been a game-changer. I connected with a supplier from another city, and we’re now working together. It’s more than a platform; it’s a support system.\""
    },
    {
        name: "Chipo Musoni",
        role: "Lead, Tech Innovations",
        avatar: "https://picsum.photos/seed/business-woman/100/100",
        avatarHint: "business woman",
        story: "\"As a tech startup, the financial projector was invaluable. It helped us secure our first round of seed funding. The insights are practical and tailored for the local market.\""
    }
]

const heroFeatures = [
    { title: "Digital Assessment", icon: <BarChart className="h-10 w-10" /> },
    { title: "AI Agents", icon: <Wrench className="h-10 w-10" /> },
    { title: "Community Forum", icon: <Users className="h-10 w-10" /> },
    { title: "Tenders & News", icon: <Briefcase className="h-10 w-10" /> },
];

export default function LandingPage() {
    const t = useTranslations();
    useEffect(() => {
      registerVisibilityHandler(
        () => { /* unload heavy resources when hidden */ },
        () => { /* reload when visible */ }
      );
    }, []);

    return (
      <div className="flex flex-col w-full min-h-[calc(100vh-57px)] bg-background overflow-x-hidden">
        
        {/* 1. Hero Section */}
        <section className="relative py-20 md:py-32">
             <div className="absolute inset-0 -z-10 h-full w-full bg-background">
                <motion.div 
                    className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"
                />
            </div>

            <div className="absolute -top-40 -left-60 lg:-left-20 w-96 h-96 bg-primary/30 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob"></div>
            <div className="absolute -bottom-40 -right-40 lg:-right-20 w-96 h-96 bg-accent/30 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-2000"></div>


            <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
                <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="space-y-6 text-center md:text-left"
                >
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">{t('app.tagline')}</h1>
                    <p className="text-lg text-muted-foreground">Assess, grow, and connect — all in one platform built for Zimbabwean entrepreneurs.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                        <Button asChild size="lg">
                            <Link href="/assessment">Start Free Assessment <ArrowRight className="ml-2 h-5 w-5" /></Link>
                        </Button>
                        <Button asChild size="lg" variant="outline">
                           <Link href="#how-it-works">See How It Works</Link>
                        </Button>
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative w-full aspect-square bg-background/30 dark:bg-card/50 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl flex items-center justify-center p-4"
                >
                   <div className="grid grid-cols-2 gap-4 text-center">
                        {heroFeatures.map((feature, index) => (
                           <motion.div 
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                                className="flex flex-col items-center justify-center p-4 space-y-2 text-primary"
                            >
                                {feature.icon}
                                <p className="text-sm font-semibold text-foreground">{feature.title}</p>
                           </motion.div>
                       ))}
                   </div>
                </motion.div>
            </div>
        </section>

        {/* 2. Social Proof Section */}
        <section className="py-12 bg-muted/50">
            <div className="container mx-auto text-center">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Trusted by SMEs Across Zimbabwe</h2>
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
                    <p className="font-semibold text-muted-foreground">SME Association</p>
                    <p className="font-semibold text-muted-foreground">Local Bank Partner</p>
                    <p className="font-semibold text-muted-foreground">Startup Hub</p>
                    <p className="font-semibold text-muted-foreground">Tech Zim</p>
                </div>
            </div>
        </section>

        {/* 3. How It Works Section */}
        <section id="how-it-works" className="py-20 md:py-24">
            <div className="container mx-auto text-center space-y-12">
                 <div>
                    <h2 className="text-3xl font-bold tracking-tight">Get Started in 3 Simple Steps</h2>
                    <p className="mt-4 text-lg text-muted-foreground">Your journey from hustle to structure starts here.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {howItWorksSteps.map((step, index) => (
                        <motion.div
                            key={step.title}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.2 }}
                            className="p-6 border rounded-lg hover:shadow-lg transition-shadow bg-card"
                        >
                            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mx-auto">
                                {step.icon}
                            </div>
                            <h3 className="mt-6 text-xl font-semibold">{step.title}</h3>
                            <p className="mt-2 text-muted-foreground">{step.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>

        {/* 4. Feature Highlights */}
        <section className="py-20 md:py-24 bg-muted/50">
            <div className="container mx-auto space-y-12">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight">A Toolkit for Transformation</h2>
                    <p className="mt-4 text-lg text-muted-foreground">Explore the features designed to give your business an edge.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                     {featureHighlights.map(feature => (
                        <Card key={feature.title} className="overflow-hidden hover:shadow-xl transition-shadow flex flex-col">
                             <CardHeader>
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                        {feature.icon}
                                    </div>
                                    <CardTitle>{feature.title}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4 flex-grow flex flex-col">
                               <p className="text-muted-foreground">{feature.description}</p>
                               <div className="flex-grow flex items-center justify-center aspect-video w-full rounded-md bg-muted/50 p-4 border border-dashed">
                                   <div className="flex flex-wrap gap-3 justify-center">
                                        {feature.infoBites.map((bite) => (
                                           <motion.div 
                                                key={bite}
                                                whileHover={{ scale: 1.05 }}
                                                className="flex items-center gap-2 px-4 py-2 bg-background/50 backdrop-blur-sm rounded-full border border-border shadow"
                                            >
                                                <ClipboardCheck className="h-4 w-4 text-primary" />
                                                <span className="font-medium text-sm">{bite}</span>
                                            </motion.div>
                                       ))}
                                   </div>
                               </div>
                                <Button variant="outline" asChild className="mt-auto">
                                    <Link href={feature.link}>Learn More</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>

        {/* 5. Impact Metrics */}
        <section className="py-20">
            <div className="container mx-auto">
                <div className="grid md:grid-cols-3 gap-8 text-center">
                    <div className="p-6">
                        <h3 className="text-5xl font-extrabold text-primary">5,000+</h3>
                        <p className="mt-2 text-muted-foreground font-medium">SMEs Assessed</p>
                    </div>
                     <div className="p-6">
                        <h3 className="text-5xl font-extrabold text-primary">300+</h3>
                        <p className="mt-2 text-muted-foreground font-medium">Tenders Posted Monthly</p>
                    </div>
                     <div className="p-6">
                        <h3 className="text-5xl font-extrabold text-primary">85%</h3>
                        <p className="mt-2 text-muted-foreground font-medium">Report Increased Sales After 3 Months</p>
                    </div>
                </div>
            </div>
        </section>

         {/* 6. Testimonials Section */}
        <section className="py-20 md:py-24 bg-muted/50">
            <div className="container mx-auto text-center space-y-12">
                 <div>
                    <h2 className="text-3xl font-bold tracking-tight">Success Stories from Our Community</h2>
                    <p className="mt-4 text-lg text-muted-foreground">Don&apos;t just take our word for it. Hear from entrepreneurs like you.</p>
                </div>
                 <Carousel
                    opts={{ align: "start", loop: true, }}
                    plugins={[Autoplay()]}
                    className="w-full max-w-4xl mx-auto"
                >
                    <CarouselContent>
                        {testimonials.map((testimonial, index) => (
                            <CarouselItem key={index}>
                                <div className="p-1">
                                    <Card>
                                        <CardContent className="flex flex-col items-center text-center p-8 gap-4">
                                            <Avatar className="w-20 h-20">
                                                <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                                                <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <p className="text-lg font-medium text-foreground italic">{testimonial.story}</p>
                                            <div className="mt-2">
                                                <p className="font-semibold">{testimonial.name}</p>
                                                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            </div>
        </section>

        {/* Ad placement after testimonials */}
        <section className="container mx-auto py-8 max-w-4xl">
          <AdUnit slot="testimonials-bottom" format="rectangle" className="min-h-[90px]" />
        </section>

        {/* 7. Final Conversion Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
             <div className="absolute inset-0 -z-10 h-full w-full bg-background">
                <motion.div 
                    className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"
                />
            </div>
            <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/30 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob"></div>
            <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-accent/30 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-2000"></div>

            <div className="container mx-auto text-center max-w-3xl relative z-10">
                <h2 className="text-4xl font-bold tracking-tight">Your SME’s Next Big Leap Starts Here</h2>
                <p className="mt-4 text-lg text-muted-foreground">No credit card needed. Start your journey to digital transformation today.</p>
                <div className="mt-8">
                     <Button asChild size="lg">
                        <Link href="/assessment">Start Free Assessment <ArrowRight className="ml-2 h-5 w-5" /></Link>
                    </Button>
                </div>
            </div>
        </section>

        {/* 8. Footer */}
        <footer className="bg-muted">
             <div className="container mx-auto py-12 px-4">
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2">
                            <Briefcase className="h-7 w-7 text-primary" />
                            <span className="font-bold text-xl">Radbit SME Hub</span>
                        </Link>
                        <p className="text-muted-foreground">Empowering Zimbabwean SMEs with the digital tools to thrive.</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:col-span-2">
                        <div>
                            <h3 className="font-semibold">Platform</h3>
                            <ul className="mt-4 space-y-2">
                                <li><Link href="/assessment" className="text-muted-foreground hover:text-primary">Assessment</Link></li>
                                <li><Link href="/agents" className="text-muted-foreground hover:text-primary">AI Agents</Link></li>
                                <li><Link href="/community" className="text-muted-foreground hover:text-primary">Community</Link></li>
                            </ul>
                        </div>
                        <div>
                             <h3 className="font-semibold">Company</h3>
                            <ul className="mt-4 space-y-2">
                                <li><a href="#" className="text-muted-foreground hover:text-primary">About Us</a></li>
                                <li><a href="#" className="text-muted-foreground hover:text-primary">Contact</a></li>
                                <li><a href="#" className="text-muted-foreground hover:text-primary">Privacy Policy</a></li>
                            </ul>
                        </div>
                         <div>
                            <h3 className="font-semibold">Connect</h3>
                             <ul className="mt-4 space-y-2">
                                <li><a href="#" className="text-muted-foreground hover:text-primary">Facebook</a></li>
                                <li><a href="#" className="text-muted-foreground hover:text-primary">X / Twitter</a></li>
                                <li><a href="#" className="text-muted-foreground hover:text-primary">LinkedIn</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                 <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} Radbit. All rights reserved.</p>
                </div>
            </div>
        </footer>

      </div>
    );
}

    

    

    