"use client";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import { motion } from "framer-motion";

export default function NetworkStatusPage() {
  const regions = [
    { name: "Midtown ATL", status: "Operational" },
    { name: "Austin", status: "Operational" },
    { name: "Seattle", status: "Degraded" },
  ];

  const towers = [
    { id: "eNB-123", region: "Midtown ATL", status: "Degraded", location: "33.7756, 84.3963" },
    { id: "eNB-456", region: "Austin", status: "Operational", location: "30.2672, 97.7431" },
    { id: "eNB-789", region: "Seattle", status: "Operational", location: "47.6062, -122.3321" },
  ];

  const incidents = [
    { date: "11/7/2025 08:30 AM", region: "Seattle", issue: "Intermittent connectivity", status: "Resolved", eta: "—" },
    { date: "11/8/2025 03:15 AM", region: "Midtown ATL", issue: "Degraded service", status: "In Progress", eta: "35 minutes" },
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
          <h1 className="text-5xl md:text-6xl font-bold font-display mb-6">
            Network Status
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Real-time updates on network performance and tower locations
          </p>
        </motion.div>

        {/* All Systems Operational Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto mb-12"
        >
          <div className="card-elevated p-8 text-center">
            <div className="flex justify-center mb-4">
              <svg className="h-16 w-16 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">All Systems Operational</h2>
            <p className="text-text-secondary mb-6">Network performance is within normal parameters</p>
            <button className="btn btn-secondary inline-flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Subscribe to Status Updates
            </button>
          </div>
        </motion.div>

        {/* Cell Tower Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-2">Cell Tower Map</h2>
          <p className="text-text-secondary mb-6">Interactive map showing real time tower locations and health status.</p>
          <div className="card-elevated p-8">
            <div className="relative h-96 bg-bg-secondary rounded-lg flex items-center justify-center">
              <div className="text-center">
                <svg className="h-12 w-12 text-primary mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="font-medium mb-1">Interactive Map</p>
                <p className="text-sm text-text-secondary">Tower locations and health status</p>
              </div>
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button className="bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-sm hover:bg-white">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
                <div className="w-full h-px bg-border"></div>
                <button className="bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-sm hover:bg-white">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
              </div>
              <div className="absolute bottom-4 left-4 text-xs text-text-tertiary">@mapbox</div>
            </div>
          </div>
        </motion.div>

        {/* Regional Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6">Regional Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {regions.map((region) => (
              <div key={region.name} className="card-elevated p-6">
                <h3 className="text-lg font-semibold mb-4">{region.name}</h3>
                <button className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                  region.status === "Operational"
                    ? "bg-success/20 text-success"
                    : "bg-warning/20 text-warning"
                }`}>
                  {region.status === "Operational" ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                  {region.status}
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tower Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-2">Tower Details</h2>
          <p className="text-text-secondary mb-6">Detailed information about each cell tower.</p>
          <div className="card-elevated overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Tower ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Region</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {towers.map((tower) => (
                    <tr key={tower.id} className="hover:bg-surface">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{tower.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{tower.region}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {tower.status === "Operational" ? (
                          <button className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-success/20 text-success">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {tower.status}
                          </button>
                        ) : (
                          <span className="text-sm text-text-secondary">{tower.status}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{tower.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Recent Incidents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold mb-2">Recent Incidents</h2>
          <p className="text-text-secondary mb-6">History of network incidents and resolutions.</p>
          <div className="card-elevated overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Region</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Issue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">ETA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {incidents.map((incident, idx) => (
                    <tr key={idx} className="hover:bg-surface">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{incident.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{incident.region}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{incident.issue}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          incident.status === "Resolved"
                            ? "bg-success/20 text-success"
                            : "bg-surface text-text-secondary"
                        }`}>
                          {incident.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{incident.eta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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

