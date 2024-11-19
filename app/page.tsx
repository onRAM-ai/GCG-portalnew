import { ParticlesBackground } from "@/components/particles-background";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const features = [
    {
      href: "/venues",
      icon: MapPin,
      title: "Venues",
      description: "Discover premium venues across Western Australia",
      color: "from-[#FFD700]/20 to-[#FFD700]/5"
    },
    {
      href: "/skimpies",
      icon: Users,
      title: "Skimpies",
      description: "Meet our experienced entertainers",
      color: "from-[#FFD700]/20 to-[#FFD700]/5"
    }
  ];

  return (
    <>
      <ParticlesBackground />
      <div className="min-h-screen relative">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center px-4">
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight gold-glow">
              Premium Entertainment Services
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed max-w-2xl mx-auto">
              Elevating hospitality experiences with professional, reliable entertainment services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/venues">
                <Button size="lg" className="text-lg h-14 px-8">
                  Browse Venues
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature) => (
                <Link key={feature.href} href={feature.href}>
                  <Card className={`group relative overflow-hidden p-8 h-[300px] transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br ${feature.color} backdrop-blur-sm border-primary/10`}>
                    <div className="relative z-10">
                      <feature.icon className="h-12 w-12 mb-6 text-primary" />
                      <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
                      <p className="text-lg text-muted-foreground mb-6">
                        {feature.description}
                      </p>
                      <Button variant="ghost" className="group-hover:translate-x-2 transition-transform">
                        Learn More <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-background/80" />
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <Card className="relative overflow-hidden p-12 bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm border-primary/10">
              <div className="relative z-10 max-w-2xl mx-auto text-center">
                <h2 className="text-4xl font-bold mb-6 gold-glow">Ready to Elevate Your Venue?</h2>
                <p className="text-xl mb-8 text-gray-300 leading-relaxed">
                  Contact us to learn more about our premium entertainment services.
                </p>
                <Link href="/contact">
                  <Button size="lg" className="text-lg h-14 px-8">
                    Get in Touch
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-background/80" />
            </Card>
          </div>
        </section>
      </div>
    </>
  );
}