import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { TopNav } from "@/components/TopNav";
import { Badge } from "@/components/ui/badge";
import { incidents } from "@/lib/mockData";
import { getTowers } from "@/lib/supabaseService";
import { Tower } from "@/lib/supabase";
import { MapboxMap } from "@/components/MapboxMap";
import { LocationPermissionDialog } from "@/components/LocationPermissionDialog";
import { useGeolocation } from "@/hooks/useGeolocation";
import { sendTowerStatusNotification, checkTelegramStatus } from "@/lib/telegramService";

interface TowerDetails {
  id: string;
  region: string;
  health: string;
  lat: number;
  lng: number;
}

const NetworkStatus = () => {
  const [selectedTower, setSelectedTower] = useState<TowerDetails | null>(null);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const [dallasTowerStates, setDallasTowerStates] = useState<Map<string, 'ok' | 'degraded'>>(new Map());
  const dallasDemoTimeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const dallasTowersRef = useRef<Tower[]>([]);
  const lastTowerStateRef = useRef<Map<string, 'ok' | 'degraded'>>(new Map()); // Track last state for Telegram notifications
  const TELEGRAM_CHAT_ID = "5367833555"; // Hardcoded Telegram Chat ID
  const locationRef = useRef<{ latitude: number; longitude: number } | null>(null);

  // Geolocation hook
  const {
    location,
    requestLocation,
    watchPosition,
    clearWatch,
    isSupported,
  } = useGeolocation();

  // Fetch towers from database
  const { data: towers = [] } = useQuery<Tower[]>({
    queryKey: ['towers'],
    queryFn: getTowers,
  });

  // Show location dialog on every page visit/refresh
  useEffect(() => {
    if (!isSupported) {
      console.log('📍 Geolocation is not supported');
      return;
    }

    // Always show dialog on mount (every page visit/refresh)
    console.log('📍 Showing location dialog');
    setShowLocationDialog(true);
  }, [isSupported]);

  // Watch position when location is available
  useEffect(() => {
    if (location.latitude && location.longitude && !location.error) {
      // Start watching position for updates
      const watchId = watchPosition((loc) => {
        if (loc.latitude && loc.longitude) {
          console.log('📍 Location updated:', loc.latitude, loc.longitude);
        }
      });
      watchIdRef.current = watchId;

      return () => {
        if (watchIdRef.current !== null) {
          clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
      };
    }
  }, [location.latitude, location.longitude, watchPosition, clearWatch, location.error]);

  // Handle location permission
  const handleAllowLocation = async () => {
    setShowLocationDialog(false);
    console.log('📍 User allowed location, requesting...');
    await requestLocation();
  };

  const handleDenyLocation = () => {
    setShowLocationDialog(false);
    console.log('📍 User denied location');
  };

  // Check if user is in Dallas area (within ~50km radius of Dallas center)
  const isInDallas = (lat: number, lng: number): boolean => {
    const dallasCenterLat = 32.7767;
    const dallasCenterLng = -96.7970;
    // Rough distance check (1 degree ≈ 111km, so 0.5 degrees ≈ 55km)
    const latDiff = Math.abs(lat - dallasCenterLat);
    const lngDiff = Math.abs(lng - dallasCenterLng);
    return latDiff < 0.5 && lngDiff < 0.5;
  };

  // Get Dallas towers
  const dallasTowers = towers.filter(tower => tower.region === 'Dallas');
  
  // Update ref with current Dallas towers
  useEffect(() => {
    dallasTowersRef.current = dallasTowers;
  }, [dallasTowers.map(t => t.id).join(',')]);

  // Dallas tower demo: Alternate tower degradation every 8 seconds
  useEffect(() => {
    // Clear any existing timeouts
    dallasDemoTimeoutsRef.current.forEach(clearTimeout);
    dallasDemoTimeoutsRef.current = [];
    
    // Get current Dallas towers from ref
    const currentDallasTowers = dallasTowersRef.current;
    
    // Capture current location in the closure
    const currentLat = location.latitude;
    const currentLng = location.longitude;
    const hasLocation = currentLat !== null && currentLng !== null && !location.error;
    const userLocationData = hasLocation ? { latitude: currentLat!, longitude: currentLng! } : null;
    
    // Check if user is in Dallas and we have at least 2 Dallas towers
    if (
      hasLocation &&
      userLocationData &&
      isInDallas(userLocationData.latitude, userLocationData.longitude) &&
      currentDallasTowers.length >= 2
    ) {
      console.log('🎯 User is in Dallas! Starting tower demo...');
      console.log(`📍 Found ${currentDallasTowers.length} Dallas towers:`, currentDallasTowers.map(t => t.id));
      console.log(`📍 User location:`, userLocationData);
      
      // Update location ref
      locationRef.current = userLocationData;
      
      // Initialize all Dallas towers to 'ok'
      const initialStates = new Map<string, 'ok' | 'degraded'>();
      currentDallasTowers.forEach(tower => {
        initialStates.set(tower.id, 'ok');
        lastTowerStateRef.current.set(tower.id, 'ok'); // Initialize last state
      });
      setDallasTowerStates(initialStates);
      console.log('🎯 Initialized', currentDallasTowers.length, 'Dallas towers to OK state');

      // Wait 5 seconds after location is verified, then start the cycle
      const startDelay = setTimeout(() => {
        let currentTowerIndex = 0;
        let isRunning = true; // Flag to track if cycle should continue
        
        // Capture location in closure to ensure it's available
        const capturedLocation = userLocationData;
        
        const cycleNextTower = () => {
          if (!isRunning) return; // Stop if cycle was cancelled
          
          // Get current tower from ref (always up to date)
          const towers = dallasTowersRef.current;
          if (towers.length === 0) {
            console.error('❌ No Dallas towers found');
            return;
          }
          
          // Ensure index is valid
          if (currentTowerIndex >= towers.length) {
            currentTowerIndex = 0;
          }
          
          const currentTower = towers[currentTowerIndex];
          if (!currentTower) {
            console.error('❌ No tower found at index', currentTowerIndex);
            return;
          }
          
          console.log(`🔄 Cycling to tower ${currentTower.id} (index ${currentTowerIndex} of ${towers.length})`);
          
          // Set current tower to degraded (red) and all others to ok
          setDallasTowerStates(prev => {
            const newStates = new Map(prev);
            // Set all towers to ok first
            towers.forEach(t => {
              newStates.set(t.id, 'ok');
            });
            // Then set current tower to degraded
            newStates.set(currentTower.id, 'degraded');
            console.log(`🔴 Tower ${currentTower.id} (Dallas) is now DEGRADED (RED)`);
            
            // Send Telegram notification if tower just became degraded
            const lastState = lastTowerStateRef.current.get(currentTower.id);
            
            console.log('🔍 Checking if notification should be sent:', {
              lastState,
              hasCapturedLocation: !!capturedLocation,
              chatId: TELEGRAM_CHAT_ID,
              towerId: currentTower.id,
              location: capturedLocation,
            });
            
            if (lastState !== 'degraded' && capturedLocation) {
              console.log('📱 ✅ Conditions met! Sending Telegram notification for tower degradation...', {
                chatId: TELEGRAM_CHAT_ID,
                towerId: currentTower.id,
                towerRegion: currentTower.region,
                location: capturedLocation,
                lastState,
              });
              
              sendTowerStatusNotification({
                chatId: TELEGRAM_CHAT_ID,
                towerId: currentTower.id,
                towerRegion: currentTower.region,
                status: 'degraded',
                userLocation: capturedLocation,
              }).then(result => {
                if (result.success) {
                  console.log('✅ Telegram notification sent successfully: Tower degraded', result);
                } else {
                  console.error('❌ Failed to send Telegram notification:', result.error);
                  console.error('Full error details:', result);
                }
              }).catch(error => {
                console.error('❌ Exception while sending Telegram notification:', error);
              });
            } else {
              console.log('⚠️ Notification NOT sent. Reasons:', {
                lastStateIsDegraded: lastState === 'degraded',
                hasLocation: !!capturedLocation,
                lastState,
                capturedLocation,
              });
            }
            
            // Update last state AFTER attempting to send notification
            lastTowerStateRef.current.set(currentTower.id, 'degraded');
            return newStates;
          });
          
          // After 7 seconds, set current tower back to ok (green)
          const restoreTimeout = setTimeout(() => {
            if (!isRunning) return;
            
            setDallasTowerStates(prev => {
              const newStates = new Map(prev);
              newStates.set(currentTower.id, 'ok');
              console.log(`🟢 Tower ${currentTower.id} (Dallas) is now OK (GREEN)`);
              
              // Send Telegram notification if tower just became ok (restored)
              const lastState = lastTowerStateRef.current.get(currentTower.id);
              
              console.log('🔍 Checking if restoration notification should be sent:', {
                lastState,
                hasCapturedLocation: !!capturedLocation,
                chatId: TELEGRAM_CHAT_ID,
                towerId: currentTower.id,
                location: capturedLocation,
              });
              
              if (lastState === 'degraded' && capturedLocation) {
                console.log('📱 ✅ Conditions met! Sending Telegram notification for tower restoration...', {
                  chatId: TELEGRAM_CHAT_ID,
                  towerId: currentTower.id,
                  towerRegion: currentTower.region,
                  location: capturedLocation,
                  lastState,
                });
                
                sendTowerStatusNotification({
                  chatId: TELEGRAM_CHAT_ID,
                  towerId: currentTower.id,
                  towerRegion: currentTower.region,
                  status: 'ok',
                  userLocation: capturedLocation,
                }).then(result => {
                  if (result.success) {
                    console.log('✅ Telegram notification sent successfully: Tower restored', result);
                  } else {
                    console.error('❌ Failed to send Telegram notification:', result.error);
                    console.error('Full error details:', result);
                  }
                }).catch(error => {
                  console.error('❌ Exception while sending Telegram notification:', error);
                });
              } else {
                console.log('⚠️ Restoration notification NOT sent. Reasons:', {
                  lastStateIsDegraded: lastState === 'degraded',
                  hasLocation: !!capturedLocation,
                  lastState,
                  capturedLocation,
                });
              }
              
              // Update last state AFTER attempting to send notification
              lastTowerStateRef.current.set(currentTower.id, 'ok');
              return newStates;
            });
            
            // After 7 more seconds (total 14s from start of this cycle), switch to next tower
            const nextTowerTimeout = setTimeout(() => {
              if (!isRunning) return;
              
              // Move to next tower (wrap around)
              const towers = dallasTowersRef.current;
              currentTowerIndex = (currentTowerIndex + 1) % towers.length;
              console.log(`⏭️ Switching to next tower. New index: ${currentTowerIndex}`);
              
              // Start cycle for next tower
              cycleNextTower();
            }, 7000);
            dallasDemoTimeoutsRef.current.push(nextTowerTimeout);
          }, 7000);
          dallasDemoTimeoutsRef.current.push(restoreTimeout);
        };
        
        // Store the isRunning flag in a way we can access it for cleanup
        (cycleNextTower as any).stop = () => {
          isRunning = false;
        };
        
        // Start the first cycle
        cycleNextTower();
      }, 5000); // Wait 5 seconds after location is verified
      
      dallasDemoTimeoutsRef.current.push(startDelay);

      // Cleanup function
      return () => {
        dallasDemoTimeoutsRef.current.forEach(clearTimeout);
        dallasDemoTimeoutsRef.current = [];
      };
    } else {
      // User is not in Dallas or doesn't have location - reset states
      setDallasTowerStates(new Map());
    }
  }, [location.latitude, location.longitude, location.error, dallasTowers.length]);

  // Merge Dallas tower states with original towers
  const towersWithDemo = towers.map(tower => {
    if (tower.region === 'Dallas' && dallasTowerStates.has(tower.id)) {
      return {
        ...tower,
        health: dallasTowerStates.get(tower.id) as 'ok' | 'degraded',
      };
    }
    return tower;
  });

  // Handler to set selected tower with current demo state
  const handleTowerClick = (tower: Tower) => {
    // Find the tower in towersWithDemo to get the current health state
    const currentTower = towersWithDemo.find(t => t.id === tower.id) || tower;
    setSelectedTower({
      id: currentTower.id,
      region: currentTower.region,
      health: currentTower.health,
      lat: currentTower.lat,
      lng: currentTower.lng,
    });
  };

  // Update selected tower health when demo state changes
  useEffect(() => {
    if (selectedTower && selectedTower.region === 'Dallas') {
      // Find the updated tower in towersWithDemo
      const updatedTower = towersWithDemo.find(t => t.id === selectedTower.id);
      if (updatedTower && updatedTower.health !== selectedTower.health) {
        // Update the selected tower's health to match the demo state
        setSelectedTower(prev => prev ? {
          ...prev,
          health: updatedTower.health,
        } : null);
      }
    }
  }, [towersWithDemo, selectedTower]);

  // Update location ref when location changes
  useEffect(() => {
    if (location.latitude !== null && location.longitude !== null && !location.error) {
      locationRef.current = { latitude: location.latitude, longitude: location.longitude };
    }
  }, [location.latitude, location.longitude, location.error]);

  // Test Telegram notification (for debugging)
  useEffect(() => {
    // Log Telegram configuration on mount
    console.log('🔧 Telegram Chat ID configured:', TELEGRAM_CHAT_ID);
    checkTelegramStatus().then(status => {
      console.log('🔧 Telegram service status:', status);
      if (!status.configured) {
        console.warn('⚠️ Telegram service not configured. Check TELEGRAM_BOT_TOKEN in .env file');
      } else {
        console.log('✅ Telegram service is configured:', status.botInfo);
      }
    }).catch(error => {
      console.error('❌ Error checking Telegram status:', error);
    });
  }, []);

  // Prepare user location for map
  const userLocation = (location.latitude !== null && location.longitude !== null && !location.error)
    ? { latitude: location.latitude, longitude: location.longitude }
    : null;

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Location Permission Dialog */}
      <LocationPermissionDialog
        open={showLocationDialog}
        onClose={handleDenyLocation}
        onAllow={handleAllowLocation}
      />

      {/* Full-screen map background */}
      <div className="fixed inset-0 z-0">
        <MapboxMap 
          className="w-full h-full" 
          onTowerClick={handleTowerClick}
          userLocation={userLocation}
          towers={towersWithDemo}
        />
      </div>

      {/* TopNav with liquid glass styling */}
      <TopNav />

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
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/60 text-xl"
                >
                  ×
                </button>
              </div>
              <Badge 
                variant={selectedTower.health === "ok" ? "default" : "secondary"}
                className={`${
                  selectedTower.health === "ok" 
                    ? "bg-green-500/20 text-green-300 border-green-500/30" 
                    : "bg-red-500/20 text-red-300 border-red-500/30"
                } backdrop-blur-sm`}
              >
                {selectedTower.health === "ok" ? (
                  <>✓ Operational</>
                ) : (
                  <>⚠ Degraded</>
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
                      {towersWithDemo
                      .filter(t => t.region === selectedTower.region)
                      .map((tower) => (
                        <div 
                          key={tower.id}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                          onClick={() => handleTowerClick(tower)}
                        >
                          <span className="font-mono text-sm text-white">{tower.id}</span>
                          <div className={`h-2 w-2 rounded-full ${
                            tower.health === "ok" ? "bg-green-400" : "bg-red-400"
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
