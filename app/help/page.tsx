"use client";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import { motion } from "framer-motion";
import { useState } from "react";

export default function HelpPage() {
  const [question, setQuestion] = useState("");

  const quickQuestions = [
    "I'm having trouble connecting to the network",
    "How do I enable Wi-Fi calling?",
    "I need help with international roaming",
    "My data isn't working",
    "Why is my phone not sending texts?",
    "My 5G isn't working",
  ];

  return (
    <>
      <Navigation />

      <main className="container-custom section-padding">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold font-display mb-6">
            AI Support Assistant
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Get instant help with network issues, device setup, and troubleshooting
          </p>
        </motion.div>

        {/* Quick Questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-4xl mx-auto mb-12"
        >
          <h2 className="text-2xl font-bold mb-2">Quick Questions</h2>
          <p className="text-text-secondary mb-6">
            Select a common issue to start troubleshooting with our AI assistant
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                className="card-elevated p-4 text-left hover:bg-surface transition-colors"
              >
                <p className="font-medium">{q}</p>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Have a Different Question */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-2xl mx-auto mb-12"
        >
          <h2 className="text-2xl font-bold mb-2">Have a Different Question?</h2>
          <p className="text-text-secondary mb-6">
            Describe your issue and our AI assistant will help you troubleshoot
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              className="input flex-1"
              placeholder="Type your question here..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <button className="btn btn-primary inline-flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Ask AI
            </button>
          </div>
        </motion.div>

        {/* Still Need Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
          <p className="text-text-secondary mb-6">
            If our AI assistant can't resolve your issue, open a support ticket and our team will help you directly
          </p>
          <button className="btn btn-primary">Open Support Ticket</button>
        </motion.div>
      </main>

      <footer className="border-t border-border mt-16 py-12 bg-bg-secondary">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-bold mb-2">T-Care</h3>
              <p className="text-sm text-text-secondary">Your trusted carrier for seamless connectivity</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">Quick Links</h3>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li><Link href="#" className="hover:text-text">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-text">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-text">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">Support</h3>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li><Link href="/help" className="hover:text-text">Help Center</Link></li>
                <li><Link href="/network-status" className="hover:text-text">Network Status</Link></li>
                <li><Link href="/coverage" className="hover:text-text">Coverage Map</Link></li>
              </ul>
            </div>
          </div>
          <div className="text-center text-sm text-text-tertiary pt-8 border-t border-border">
            <p>&copy; 2025 T-Care. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}

