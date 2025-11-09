import { supabase, isSupabaseConfigured, ServicePlan, Device, Tower, StatusSnapshot } from './supabase';
import { plans, devices, deviceImages, towers } from './mockData';

// Service Plans API
export const getServicePlans = async (): Promise<ServicePlan[]> => {
  console.log('🔄 getServicePlans() called - Checking Supabase configuration...');
  
  // Always try Supabase first, even if not configured (might be set at runtime)
  try {
    console.log('🌐 Attempting to fetch plans from Supabase...');
    const { data, error } = await supabase
      .from('service_plans')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true });

    console.log('📦 Supabase response:', { dataLength: data?.length || 0, error: error?.message || null });

    // If we got data from Supabase, use it
    if (data && data.length > 0 && !error) {
      console.log('✅ SUCCESS: Loaded', data.length, 'plans from Supabase database!');
      // Mark data as from database by adding a flag
      return data.map(plan => ({ ...plan, _fromDatabase: true }));
    }

    // If there's an error but Supabase is configured, log it
    if (error) {
      if (isSupabaseConfigured()) {
        console.error('❌ ERROR: Supabase is configured but returned error:', error.message);
        console.error('❌ Full error:', error);
      } else {
        console.warn('⚠️ Supabase not configured (missing env variables), using mock data');
      }
    }

    // If Supabase is not configured or returned no data, use mock data
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ WARNING: Supabase not configured - VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY missing');
      console.warn('⚠️ Using mock data instead. To use database, create .env file with Supabase credentials.');
    } else if (data && data.length === 0) {
      console.warn('⚠️ WARNING: Supabase returned empty result (no plans found)');
      console.warn('⚠️ Make sure you ran the SQL schema in Supabase. Using mock data.');
    }
  } catch (error: any) {
    console.error('❌ EXCEPTION: Failed to fetch from Supabase:', error?.message || error);
    console.error('❌ Error details:', error);
  }

  // Fallback to mock data
  console.log('📦 FALLBACK: Using mock data for plans (', plans.length, 'plans)');
  return plans.map(plan => ({
    id: plan.id,
    name: plan.name,
    price: plan.price,
    popular: plan.popular || false,
    features: plan.features,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true,
    _fromDatabase: false, // Mark as mock data
  }));
};

export const getServicePlanById = async (id: string): Promise<ServicePlan | null> => {
  if (!isSupabaseConfigured()) {
    const plan = plans.find(p => p.id === id);
    if (!plan) return null;
    return {
      id: plan.id,
      name: plan.name,
      price: plan.price,
      popular: plan.popular || false,
      features: plan.features,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
    };
  }

  try {
    const { data, error } = await supabase
      .from('service_plans')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching service plan:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching service plan:', error);
    return null;
  }
};

// Devices API
export const getDevices = async (filters?: {
  os?: string;
  supports_5g?: boolean;
  supports_esim?: boolean;
}): Promise<Device[]> => {
  // Helper function to filter and map mock devices
  const getMockDevices = () => {
    let filteredDevices = devices;
    
    if (filters?.os) {
      filteredDevices = filteredDevices.filter(d => d.os === filters.os);
    }
    if (filters?.supports_5g !== undefined) {
      filteredDevices = filteredDevices.filter(d => d.supports5G === filters.supports_5g);
    }
    if (filters?.supports_esim !== undefined) {
      filteredDevices = filteredDevices.filter(d => d.supportsESIM === filters.supports_esim);
    }

    return filteredDevices.map(device => ({
      id: device.id,
      name: device.name,
      os: device.os,
      supports_5g: device.supports5G,
      supports_esim: device.supportsESIM,
      price: device.price,
      image_url: device.image || null,
      devices_pics_url: deviceImages[device.id] || null, // Use hardcoded device images
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_available: true,
      _fromDatabase: false, // Mark as mock data
    }));
  };

  // Always try Supabase first, even if not configured (might be set at runtime)
  console.log('🔄 getDevices() called with filters:', filters);
  
  try {
    console.log('🌐 Attempting to fetch devices from Supabase...');
    let query = supabase
      .from('devices')
      .select('*')
      .eq('is_available', true);

    if (filters?.os) {
      query = query.eq('os', filters.os);
    }
    if (filters?.supports_5g !== undefined) {
      query = query.eq('supports_5g', filters.supports_5g);
    }
    if (filters?.supports_esim !== undefined) {
      query = query.eq('supports_esim', filters.supports_esim);
    }

    const { data, error } = await query.order('price', { ascending: true, nullsFirst: false });

    console.log('📦 Supabase response:', { dataLength: data?.length || 0, error: error?.message || null });

          // If we got data from Supabase, use it
          if (data && data.length > 0 && !error) {
            console.log('✅ SUCCESS: Loaded', data.length, 'devices from Supabase database!');
            // Add hardcoded device images to database devices (fallback to hardcoded if DB doesn't have image)
            return data.map(device => ({
              ...device,
              devices_pics_url: device.devices_pics_url || deviceImages[device.id] || device.image_url || null,
              _fromDatabase: true
            }));
          }

    // If there's an error but Supabase is configured, log it
    if (error) {
      if (isSupabaseConfigured()) {
        console.error('❌ ERROR: Supabase is configured but returned error:', error.message);
        console.error('❌ Full error:', error);
      } else {
        console.warn('⚠️ Supabase not configured (missing env variables), using mock data');
      }
    }

    // If Supabase is not configured or returned no data, use mock data
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ WARNING: Supabase not configured - VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY missing');
      console.warn('⚠️ Using mock data instead. To use database, create .env file with Supabase credentials.');
    } else if (data && data.length === 0) {
      console.warn('⚠️ WARNING: Supabase returned empty result (no devices found)');
      console.warn('⚠️ Make sure you ran the SQL schema in Supabase. Using mock data.');
    }
  } catch (error: any) {
    console.error('❌ EXCEPTION: Failed to fetch from Supabase:', error?.message || error);
    console.error('❌ Error details:', error);
  }

  // Fallback to mock data
  console.log('📦 FALLBACK: Using mock data for devices (', devices.length, 'devices)');
  return getMockDevices();
};

export const getDeviceById = async (id: string): Promise<Device | null> => {
  if (!isSupabaseConfigured()) {
    const device = devices.find(d => d.id === id);
    if (!device) return null;
    return {
      id: device.id,
      name: device.name,
      os: device.os,
      supports_5g: device.supports5G,
      supports_esim: device.supportsESIM,
      price: device.price,
      image_url: device.image || null,
      devices_pics_url: deviceImages[id] || null, // Use hardcoded device images
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_available: true,
      _fromDatabase: false,
    };
  }

  try {
    const { data, error } = await supabase
      .from('devices')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching device:', error);
      return null;
    }

    if (data) {
      // Add hardcoded device image as fallback if DB doesn't have one
      return {
        ...data,
        devices_pics_url: data.devices_pics_url || deviceImages[id] || data.image_url || null,
        _fromDatabase: true
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching device:', error);
    return null;
  }
};

// Towers API
export const getTowers = async (): Promise<Tower[]> => {
  console.log('🔄 getTowers() called - Checking Supabase configuration...');

  // Always try Supabase first
  try {
    console.log('🌐 Attempting to fetch towers from Supabase...');
    const { data, error } = await supabase
      .from('status_snapshots')
      .select('*')
      .not('tower_id', 'is', null)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .order('created_at', { ascending: false });

    console.log('📦 Supabase response:', { dataLength: data?.length || 0, error: error?.message || null });

    // If we got data from Supabase, transform it to Tower format
    if (data && data.length > 0 && !error) {
      console.log('✅ SUCCESS: Loaded', data.length, 'towers from Supabase database!');
      
      // Get unique towers (by tower_id), taking the most recent snapshot for each tower
      const towerMap = new Map<string, StatusSnapshot>();
      data.forEach((snapshot: StatusSnapshot) => {
        if (snapshot.tower_id && snapshot.latitude && snapshot.longitude) {
          const existing = towerMap.get(snapshot.tower_id);
          if (!existing || new Date(snapshot.created_at) > new Date(existing.created_at)) {
            towerMap.set(snapshot.tower_id, snapshot);
          }
        }
      });

      const uniqueTowers: Tower[] = Array.from(towerMap.values()).map((snapshot: StatusSnapshot) => ({
        id: snapshot.tower_id!,
        region: snapshot.region,
        health: snapshot.health as 'ok' | 'degraded',
        lat: snapshot.latitude!,
        lng: snapshot.longitude!,
        tower_id: snapshot.tower_id!,
        network_happiness_score: snapshot.network_happiness_score || undefined,
        eta_minutes: snapshot.eta_minutes || undefined,
        sparkline: snapshot.sparkline || undefined,
        _fromDatabase: true,
      }));

      console.log('📊 Unique towers found:', uniqueTowers.length);
      return uniqueTowers;
    }

    // If there's an error but Supabase is configured, log it
    if (error) {
      if (isSupabaseConfigured()) {
        console.error('❌ ERROR: Supabase is configured but returned error:', error.message);
        console.error('❌ Full error:', error);
      } else {
        console.warn('⚠️ Supabase not configured (missing env variables), using mock data');
      }
    }

    // If Supabase is not configured or returned no data, use mock data
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ WARNING: Supabase not configured - VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY missing');
      console.warn('⚠️ Using mock data instead. To use database, create .env file with Supabase credentials.');
    } else if (data && data.length === 0) {
      console.warn('⚠️ WARNING: Supabase returned empty result (no towers found)');
      console.warn('⚠️ Make sure you ran the SQL script to insert towers. Using mock data.');
    }
  } catch (error: any) {
    console.error('❌ EXCEPTION: Failed to fetch from Supabase:', error?.message || error);
    console.error('❌ Error details:', error);
  }

  // Fallback to mock data
  console.log('📦 FALLBACK: Using mock data for towers (', towers.length, 'towers)');
  return towers.map(tower => ({
    id: tower.id,
    region: tower.region,
    health: tower.health as 'ok' | 'degraded',
    lat: tower.lat,
    lng: tower.lng,
    _fromDatabase: false,
  }));
};

