"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, Activity, Building2, Shield, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6 mb-16"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-blue">
            Fintech Dashboard
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Complete fintech platform for trading, mining, real estate investments, and more.
            Manage your finances with ease and security.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/auth/login">
              <Button size="lg">Login</Button>
            </Link>
            <Link href="/auth/register">
              <Button size="lg" variant="outline">Sign Up</Button>
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Wallet className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Multi-Currency Wallets</CardTitle>
                <CardDescription>
                  Manage multiple balances including main, mining, trade, real estate, and referral balances
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Advanced Trading</CardTitle>
                <CardDescription>
                  Execute CFD, Forex, and Crypto trades with leverage, take profit, and stop loss options
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Activity className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Mining Pools</CardTitle>
                <CardDescription>
                  Stake in mining pools and earn passive income with competitive ROI rates
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Building2 className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Real Estate Investments</CardTitle>
                <CardDescription>
                  Invest in curated real estate portfolios with detailed project breakdowns
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Security & KYC</CardTitle>
                <CardDescription>
                  Two-factor authentication and KYC verification for enhanced account security
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Copy Trading</CardTitle>
                <CardDescription>
                  Follow experienced traders and automatically copy their successful strategies
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="text-center"
        >
          <Link href="/auth/register">
            <Button size="lg" className="group">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
