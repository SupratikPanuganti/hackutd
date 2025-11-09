import { useState } from "react";
import { TopNav } from "@/components/TopNav";
import { Badge } from "@/components/ui/badge";
import { incidents, towers } from "@/lib/mockData";
import { CheckCircle, AlertCircle, X } from "lucide-react";
import { MapboxMap } from "@/components/MapboxMap";

interface TowerDetails {
  id: string;
  region: string;
  health: string;
  lat: number;
  lng: number;
}

const NetworkStatus = () => {
  const [selectedTower, setSelectedTower] = useState<TowerDetails | null>(null);

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Full-screen map background */}
      <div className="fixed inset-0 z-0">
        <MapboxMap 
          className="w-full h-full" 
          onTowerClick={setSelectedTower}
        />
      </div>

      {/* Glassmorphic Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-20">
        <div className="backdrop-blur-xl bg-black/30 border-b border-white/10 shadow-2xl">
          <TopNav />
        </div>
      </div>

      {/* Tower Details Sidebar - Glassmorphic */}
      {selectedTower && (
        <div className="fixed right-4 top-24 bottom-4 z-30 w-96 pointer-events-auto animate-in slide-in-from-right duration-300">
          <div className="h-full backdrop-blur-2xl bg-gradient-to-br from-black/70 via-black/60 to-black/50 
                          border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">{selectedTower.id}</h2>
                  <p className="text-white/60">{selectedTower.region} Region</p>
                </div>
                <button 
                  onClick={() => setSelectedTower(null)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X className="h-5 w-5 text-white/60" />
                </button>
              </div>
              <Badge 
                variant={selectedTower.health === "ok" ? "default" : "secondary"}
                className={`${
                  selectedTower.health === "ok" 
                    ? "bg-green-500/20 text-green-300 border-green-500/30" 
                    : "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                } backdrop-blur-sm`}
              >
                {selectedTower.health === "ok" ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Operational
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Degraded
                  </>
                )}
              </Badge>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Location */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-sm text-white/60 mb-2 font-medium">Location Coordinates</p>
                <p className="font-mono text-white text-lg">
                  {selectedTower.lat.toFixed(4)}°N, {selectedTower.lng.toFixed(4)}°W
                </p>
              </div>

              {/* Related Incidents */}
              {incidents.filter(inc => inc.region === selectedTower.region).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Regional Incidents</h3>
                  <div className="space-y-3">
                    {incidents
                      .filter(inc => inc.region === selectedTower.region)
                      .map((incident) => (
                        <div 
                          key={incident.id}
                          className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <p className="text-sm font-semibold text-white">{incident.issue}</p>
                            <Badge 
                              variant={incident.resolved ? "default" : "secondary"}
                              className={`${
                                incident.resolved 
                                  ? "bg-green-500/20 text-green-300 border-green-500/30" 
                                  : "bg-red-500/20 text-red-300 border-red-500/30"
                              } backdrop-blur-sm text-xs`}
                            >
                              {incident.resolved ? "Resolved" : "Active"}
                            </Badge>
                          </div>
                          <p className="text-xs text-white/60">
                            {new Date(incident.date).toLocaleDateString()} • {new Date(incident.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {incident.eta && (
                            <p className="text-xs text-white/80 mt-2">
                              ETA: {incident.eta}
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Regional Overview */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Regional Overview</h3>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-sm text-white/60 mb-3">
                    Towers in {selectedTower.region}
                  </p>
                  <div className="space-y-2">
                    {towers
                      .filter(t => t.region === selectedTower.region)
                      .map((tower) => (
                        <div 
                          key={tower.id}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                          onClick={() => setSelectedTower(tower)}
                        >
                          <span className="font-mono text-sm text-white">{tower.id}</span>
                          <div className={`h-2 w-2 rounded-full ${
                            tower.health === "ok" ? "bg-green-400" : "bg-yellow-400"
                          }`} />
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkStatus;
