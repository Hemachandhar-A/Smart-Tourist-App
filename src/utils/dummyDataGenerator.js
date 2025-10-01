// Seedable random number generator (Mulberry32)
function mulberry32(seed) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Box-Muller transform for Gaussian distribution
function gaussianRandom(rng, mean = 0, stdDev = 1) {
  const u1 = rng();
  const u2 = rng();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * stdDev + mean;
}

const ATTRACTIONS = [
  'Heritage Fort', 'Cultural Museum', 'Ancient Temple', 'Royal Palace',
  'Botanical Gardens', 'Historic Market', 'Art Gallery', 'Riverside Park',
  'Memorial Monument', 'Observation Tower', 'Science Center', 'Aquarium'
];

const NATIONALITIES = [
  { code: 'IN', weight: 0.6 },
  { code: 'US', weight: 0.08 },
  { code: 'UK', weight: 0.06 },
  { code: 'DE', weight: 0.05 },
  { code: 'FR', weight: 0.04 },
  { code: 'AU', weight: 0.03 },
  { code: 'JP', weight: 0.03 },
  { code: 'CN', weight: 0.03 },
  { code: 'CA', weight: 0.02 },
  { code: 'BR', weight: 0.02 },
  { code: 'IT', weight: 0.02 },
  { code: 'ES', weight: 0.02 }
];

const AGE_RANGES = ['18-25', '26-35', '36-45', '46-55', '56-65', '65+'];

const CITY_NAMES = {
  'delhi': 'New Delhi',
  'mumbai': 'Mumbai',
  'london': 'London',
  'paris': 'Paris',
  'tokyo': 'Tokyo',
  'newyork': 'New York'
};

// Generate hotspot clusters around admin location
function generateHotspots(adminLocation, count = 5, rng) {
  const hotspots = [];
  const baseRadius = 0.015; // ~1.5km

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * 2 * Math.PI;
    const distance = baseRadius * (0.5 + rng() * 1.5);

    hotspots.push({
      lat: adminLocation.lat + Math.cos(angle) * distance,
      lng: adminLocation.lng + Math.sin(angle) * distance,
      sigma: 0.003 + rng() * 0.005,
      attraction: ATTRACTIONS[i % ATTRACTIONS.length],
      weight: 0.1 + rng() * 0.3
    });
  }

  return hotspots;
}

// Weighted random selection
function weightedRandom(items, rng) {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = rng() * totalWeight;

  for (const item of items) {
    random -= item.weight;
    if (random <= 0) return item.code;
  }

  return items[0].code;
}

// Generate visitor events
export function generateVisitorData(config = {}) {
  const {
    seed = 12345,
    count = 5000,
    adminLocation = { lat: 28.6139, lng: 77.2090 },
    startDate = new Date('2025-09-23T00:00:00Z'),
    endDate = new Date('2025-09-30T23:59:59Z'),
    hotspotCount = 6
  } = config;

  const rng = mulberry32(seed);
  const hotspots = generateHotspots(adminLocation, hotspotCount, rng);
  const visitors = [];

  const timeRange = endDate.getTime() - startDate.getTime();

  for (let i = 0; i < count; i++) {
    // Select hotspot with weighted probability
    const totalWeight = hotspots.reduce((sum, h) => sum + h.weight, 0);
    let random = rng() * totalWeight;
    let selectedHotspot = hotspots[0];

    for (const hotspot of hotspots) {
      random -= hotspot.weight;
      if (random <= 0) {
        selectedHotspot = hotspot;
        break;
      }
    }

    // Generate position around selected hotspot
    const lat = gaussianRandom(rng, selectedHotspot.lat, selectedHotspot.sigma);
    const lng = gaussianRandom(rng, selectedHotspot.lng, selectedHotspot.sigma);

    // Generate timestamp with realistic daily patterns
    const dayProgress = rng();
    let hourBias;

    if (dayProgress < 0.1) {
      hourBias = 0.2 + rng() * 0.2; // 8-12 AM peak
    } else if (dayProgress < 0.3) {
      hourBias = 0.4 + rng() * 0.15; // 12-3 PM moderate
    } else if (dayProgress < 0.6) {
      hourBias = 0.55 + rng() * 0.2; // 3-7 PM peak
    } else {
      hourBias = 0.75 + rng() * 0.25; // 7 PM-midnight low
    }

    const dayTimestamp = startDate.getTime() + (rng() * timeRange);
    const dayStart = new Date(dayTimestamp);
    dayStart.setHours(8, 0, 0, 0);
    const dayEnd = new Date(dayTimestamp);
    dayEnd.setHours(22, 0, 0, 0);
    const dayRange = dayEnd.getTime() - dayStart.getTime();

    const timestamp = new Date(dayStart.getTime() + (hourBias * dayRange));

    // Group size with bias towards smaller groups
    const groupRoll = rng();
    let groupSize;
    if (groupRoll < 0.4) groupSize = 1;
    else if (groupRoll < 0.7) groupSize = 2;
    else if (groupRoll < 0.85) groupSize = 3;
    else if (groupRoll < 0.95) groupSize = 4;
    else groupSize = Math.floor(5 + rng() * 2);

    // Dwell time influenced by group size
    const baseDwell = 30 + rng() * 90;
    const dwellTimeMinutes = Math.round(baseDwell + (groupSize * 10));

    visitors.push({
      id: `visitor-${seed}-${i}`,
      lat: Math.max(-90, Math.min(90, lat)),
      lng: Math.max(-180, Math.min(180, lng)),
      timestamp: timestamp.toISOString(),
      attraction: selectedHotspot.attraction,
      nationality: weightedRandom(NATIONALITIES, rng),
      groupSize,
      dwellTimeMinutes: Math.min(240, dwellTimeMinutes),
      ageRange: AGE_RANGES[Math.floor(rng() * AGE_RANGES.length)]
    });
  }

  // Sort by timestamp
  visitors.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  return visitors;
}

// Predefined seeds for different scenarios
export const SCENARIOS = {
  delhi: {
    seed: 12345,
    adminLocation: { lat: 28.6139, lng: 77.2090 },
    cityName: 'New Delhi',
    count: 5000,
    hotspotCount: 6
  },
  mumbai: {
    seed: 54321,
    adminLocation: { lat: 19.0760, lng: 72.8777 },
    cityName: 'Mumbai',
    count: 6000,
    hotspotCount: 7
  },
  london: {
    seed: 11111,
    adminLocation: { lat: 51.5074, lng: -0.1278 },
    cityName: 'London',
    count: 4500,
    hotspotCount: 5
  },
  paris: {
    seed: 22222,
    adminLocation: { lat: 48.8566, lng: 2.3522 },
    cityName: 'Paris',
    count: 5500,
    hotspotCount: 6
  }
};

export function getScenarioData(scenarioKey = 'delhi') {
  const scenario = SCENARIOS[scenarioKey] || SCENARIOS.delhi;
  return {
    data: generateVisitorData(scenario),
    config: scenario
  };
}
