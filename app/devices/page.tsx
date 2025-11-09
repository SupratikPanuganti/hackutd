"use client";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import { motion } from "framer-motion";
import { useState } from "react";

export default function DevicesPage() {
  const [filter, setFilter] = useState("All Devices");

  const devices = [
    { name: "iPhone 16 Pro", price: "$999", tags: ["iOS", "5G", "eSIM"] },
    { name: "Google Pixel 9", price: "$799", tags: ["Android", "5G", "eSIM"] },
    { name: "Samsung Galaxy S25", price: "$899", tags: ["Android", "5G", "eSIM"] },
    { name: "iPhone 15", price: "$699", tags: ["iOS", "5G", "eSIM"] },
    { name: "OnePlus 12", price: "$699", tags: ["Android", "5G"] },
    { name: "Samsung Galaxy A54", price: "$449", tags: ["Android", "5G"] },
  ];

  const filters = ["All Devices", "iOS", "Android", "5G", "eSIM"];

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
          <h1 className="text-5xl md:text-6xl font-bold font-display mb-6">
            Our Devices
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Choose from the latest smartphones, all 5G ready
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap gap-3 justify-center mb-12"
        >
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f
                  ? "bg-primary text-white"
                  : "bg-surface text-text-secondary hover:bg-surface-hover"
              }`}
            >
              {f}
            </button>
          ))}
        </motion.div>

        {/* Device Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          {devices.map((device, idx) => (
            <div key={idx} className="card-elevated p-6 hover:scale-[1.02] transition-transform">
              <div className="aspect-square bg-bg-secondary rounded-lg flex items-center justify-center mb-4">
                <svg className="h-24 w-24 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">{device.name}</h3>
              <p className="text-2xl font-bold mb-4">{device.price}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {device.tags.map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-surface rounded-full text-xs text-text-secondary">
                    {tag}
                  </span>
                ))}
              </div>
              <button className="btn btn-secondary w-full">View Details</button>
            </div>
          ))}
        </motion.div>

        {/* Setup Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-bg-secondary rounded-lg p-8 text-center"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Need Help Setting Up?</h2>
          <p className="text-text-secondary mb-6 max-w-2xl mx-auto">
            Check out our device setup guides for step-by-step instructions on configuring Wi-Fi Calling, APN settings, and more.
          </p>
          <button className="btn btn-primary">View Setup Guides</button>
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

