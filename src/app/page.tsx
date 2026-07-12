"use client";

import { SendForm } from "@/components/send-form";
import { TransactionHistory } from "@/components/transaction-history";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Droplets, Zap, Shield, Share2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-droplet-950/20">
      {/* Hero */}
      <section className="container mx-auto px-4 pt-16 pb-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-droplet-600 flex items-center justify-center animate-float">
            <Droplets className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Send to <span className="text-droplet-500">anyone</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Username, email, or phone. No wallet addresses. Just send.
          </p>
        </motion.div>
      </section>

      {/* Send Form */}
      <section className="container mx-auto px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-md mx-auto"
        >
          <Card className="border-droplet-500/20 shadow-xl shadow-droplet-500/5">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl">Send a Droplet 💧</CardTitle>
              <CardDescription>
                Enter recipient and amount
              </CardDescription>
            </CardHeader>
            <SendForm />
          </Card>
        </motion.div>
      </section>

      {/* Transaction History */}
      <section className="container mx-auto px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-md mx-auto"
        >
          <TransactionHistory />
        </motion.div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {[
            {
              icon: Zap,
              title: "Instant",
              desc: "Sends in seconds, not minutes",
            },
            {
              icon: Shield,
              title: "On-chain",
              desc: "Verifiable, transparent, permanent",
            },
            {
              icon: Share2,
              title: "Shareable",
              desc: "Beautiful receipts you can share",
            },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
              className="text-center p-6"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-droplet-500/10 flex items-center justify-center">
                <feature.icon className="h-6 w-6 text-droplet-500" />
              </div>
              <h3 className="font-semibold mb-1">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}
