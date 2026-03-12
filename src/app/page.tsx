import Link from "next/link";
import { Users, Megaphone, CreditCard, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";

export default async function LandingPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading text-h4 text-gray-950">InfluencerConnect</span>
          </Link>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Button asChild>
                <Link href="/dashboard">Go to dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Get started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gray-950 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-display font-heading mb-6">
            Connect with the right creators.{" "}
            <span className="text-brand-500">Launch campaigns that convert.</span>
          </h1>
          <p className="text-body-lg text-gray-400 max-w-2xl mx-auto mb-10">
            The two-sided marketplace where brands find authentic influencers and
            creators build real partnerships — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-brand-600 hover:bg-brand-700">
              <Link href="/register?role=COMPANY">
                Find Influencers
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-white/20 text-white hover:bg-white/10 bg-transparent"
            >
              <Link href="/register?role=INFLUENCER">Join as Influencer</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-overline text-brand-600 uppercase tracking-wider mb-3">How it works</p>
            <h2 className="text-h1 font-heading text-gray-950">Simple. Fast. Effective.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Megaphone,
                title: "Post a Campaign",
                description:
                  "Companies post detailed campaign briefs with budgets, deliverables, and target audiences.",
              },
              {
                icon: Users,
                title: "Discover & Apply",
                description:
                  "Influencers browse campaigns matching their niche and apply with personalised proposals.",
              },
              {
                icon: CreditCard,
                title: "Collaborate & Pay",
                description:
                  "Work together seamlessly with built-in messaging, content review, and secure payments.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-brand-600" />
                </div>
                <h3 className="text-h3 font-heading text-gray-950 mb-2">{item.title}</h3>
                <p className="text-body text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-brand-600 py-16 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          {[
            { value: "10K+", label: "Creators" },
            { value: "2K+", label: "Brands" },
            { value: "$5M+", label: "Paid Out" },
            { value: "98%", label: "Satisfaction" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-display font-heading mb-1">{stat.value}</div>
              <div className="text-body text-brand-100">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-h1 font-heading text-gray-950">Everything you need</h2>
            <p className="text-body-lg text-gray-600 mt-3">
              A complete platform for managing influencer partnerships end-to-end.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {[
              "Verified influencer profiles with audience analytics",
              "Campaign management from brief to payment",
              "Real-time messaging between brands and creators",
              "Secure escrow payments via Stripe Connect",
              "Content submission and review workflow",
              "Ratings and reviews for trust building",
            ].map((feature) => (
              <div key={feature} className="flex items-start gap-3 p-4">
                <CheckCircle2 className="w-5 h-5 text-success-600 shrink-0 mt-0.5" />
                <span className="text-body text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-h1 font-heading text-gray-950 mb-4">
            Ready to get started?
          </h2>
          <p className="text-body-lg text-gray-600 mb-8">
            Join thousands of brands and creators already on InfluencerConnect.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isLoggedIn ? (
              <Button size="lg" asChild>
                <Link href="/dashboard">Go to dashboard</Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild>
                  <Link href="/register">Create your account</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand-600 rounded-md flex items-center justify-center">
              <Users className="w-3 h-3 text-white" />
            </div>
            <span className="font-heading text-white">InfluencerConnect</span>
          </div>
          <p className="text-caption">© 2026 InfluencerConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
