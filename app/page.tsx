"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Wallet,
  TrendingUp,
  Activity,
  Building2,
  Shield,
  ArrowRight,
  Users,
  Zap,
  Globe,
  CheckCircle2,
  BarChart3,
} from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: Wallet,
      title: "Multi-Currency Wallets",
      description: "Manage multiple balances including main, mining, trade, real estate, and referral balances",
      gradient: "from-primary to-primary-dark",
    },
    {
      icon: TrendingUp,
      title: "Advanced Trading",
      description: "Execute CFD, Forex, and Crypto trades with leverage, take profit, and stop loss options",
      gradient: "from-blue to-blue-bright",
    },
    {
      icon: Activity,
      title: "Mining Pools",
      description: "Stake in mining pools and earn passive income with competitive ROI rates",
      gradient: "from-purple to-purple-light",
    },
    {
      icon: Building2,
      title: "Real Estate Investments",
      description: "Invest in curated real estate portfolios with detailed project breakdowns",
      gradient: "from-primary-dark to-primary",
    },
    {
      icon: Shield,
      title: "Security & KYC",
      description: "Two-factor authentication and KYC verification for enhanced account security",
      gradient: "from-blue-sky to-blue",
    },
    {
      icon: Zap,
      title: "Copy Trading",
      description: "Follow experienced traders and automatically copy their successful strategies",
      gradient: "from-primary to-blue",
    },
  ];

  const stats = [
    { label: "Active Users", value: "50K+", icon: Users },
    { label: "Total Volume", value: "$2.5B+", icon: BarChart3 },
    { label: "Countries", value: "150+", icon: Globe },
    { label: "Success Rate", value: "99.9%", icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-screen bg-background-darkest">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(1,178,139,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(12,108,242,0.08),transparent_50%)]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 sm:pt-32 sm:pb-24">
          <div className="flex flex-col items-center justify-center text-center">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="mb-6"
            >
              <Image
                src="/assets/fintech.svg"
                alt="Fintech Logo"
                width={80}
                height={80}
                className="flex-shrink-0"
              />
            </motion.div>
            {/* Trust Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mb-8"
            >
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-medium tracking-wide shadow-sm">
                Trusted by 50,000+ Users Worldwide
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6 max-w-5xl"
            >
              <span className="block bg-gradient-to-r from-primary via-blue to-purple bg-clip-text text-transparent mb-2">
                Your Gateway to
              </span>
              <span className="block text-white">
                Decentralized Finance
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="text-sm sm:text-base md:text-lg text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed font-light"
            >
              Trade, mine, invest in real estate, and manage your crypto assets with ease.
              <span className="text-primary font-normal"> Secure, fast, and user-friendly.</span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
            >
              <Link href="/auth/register" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="group w-full sm:w-auto px-6 py-4 text-sm font-semibold bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
              <Link href="/auth/login" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto px-6 py-4 text-sm font-semibold border-2 border-gray-700/50 hover:border-primary/60 hover:bg-primary/5 transition-all duration-300 shadow-sm"
                >
                  Sign In
                </Button>
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-sm text-gray-400"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="whitespace-nowrap">No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="whitespace-nowrap">Bank-Level Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="whitespace-nowrap">24/7 Support</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative w-full bg-background-darker/30 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary/15 to-blue/15 mb-4 shadow-md">
                    <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                  </div>
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-sm sm:text-base text-gray-400 font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative w-full bg-background-darkest">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-28">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-16 sm:mb-20"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight tracking-tight">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-primary to-blue bg-clip-text text-transparent">
                Succeed
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Powerful tools and features designed to help you manage and grow your wealth
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                >
                  <Card className="group relative h-full overflow-hidden bg-background-darker/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10">
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                    <CardHeader className="relative z-10 p-6 sm:p-8">
                      <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${feature.gradient} mb-5 sm:mb-6 group-hover:scale-105 transition-transform duration-300 shadow-lg`}>
                        <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                      </div>
                      <CardTitle className="text-lg sm:text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors duration-300 leading-tight">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="text-sm sm:text-base text-gray-400 leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative w-full bg-background-darker/50 shadow-inner">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-blue/3 to-purple/3" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center space-y-6 sm:space-y-8"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
              Ready to Get Started?
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Join thousands of users who are already managing their finances with our platform
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/auth/register" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="group w-full sm:w-auto px-6 py-4 text-sm font-semibold bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300"
                >
                  Create Free Account
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
              <Link href="/auth/login" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto px-6 py-4 text-sm font-semibold border-2 border-gray-700/50 hover:border-primary/60 hover:bg-primary/5 transition-all duration-300 shadow-sm"
                >
                  Sign In to Existing Account
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
