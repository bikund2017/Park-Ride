import { faker } from '@faker-js/faker';
import { db } from '../firebase.js';

// Mock data generation for Vercel (since we can't run real-time updates)
function generateTransitData() {
  const metroLines = [
    { name: 'Red Line (Rithala - Shaheed Sthal)', color: '#E41E26', stations: 29 },
    { name: 'Blue Line (Dwarka - Noida/Vaishali)', color: '#0066B3', stations: 50 },
    { name: 'Yellow Line (Samaypur Badli - HUDA City Centre)', color: '#FFD100', stations: 37 },
    { name: 'Green Line (Mundka - Inderlok)', color: '#00A650', stations: 23 },
    { name: 'Violet Line (Kashmere Gate - Raja Nahar Singh)', color: '#9B26AF', stations: 34 },
    { name: 'Pink Line (Majlis Park - Shiv Vihar)', color: '#E91E63', stations: 38 },
    { name: 'Magenta Line (Janakpuri West - Botanical Garden)', color: '#FF00FF', stations: 25 },
    { name: 'Orange Line (New Delhi - Dwarka)', color: '#FF6600', stations: 6 },
    { name: 'Rapid Metro (Sikanderpur - Cyber City)', color: '#00CED1', stations: 5 },
    { name: 'Aqua Line (Noida Sector 51 - Depot)', color: '#00BFFF', stations: 21 }
  ];

  const delhiLocations = [
    { name: 'Rajiv Chowk Metro', coords: [28.6328, 77.2197], type: 'metro' },
    { name: 'Kashmere Gate Metro', coords: [28.6676, 77.2285], type: 'metro' },
    { name: 'Hauz Khas Metro', coords: [28.5494, 77.2001], type: 'metro' },
    { name: 'Dwarka Sector 21 Metro', coords: [28.5521, 77.0590], type: 'metro' },
    { name: 'Noida City Centre Metro', coords: [28.5744, 77.3564], type: 'metro' },
    { name: 'Chandni Chowk Metro', coords: [28.6506, 77.2303], type: 'metro' },
    { name: 'AIIMS Metro', coords: [28.5672, 77.2100], type: 'metro' },
    { name: 'Botanical Garden Metro', coords: [28.5641, 77.3344], type: 'metro' },
    { name: 'Vaishali Metro', coords: [28.6491, 77.3410], type: 'metro' },
    { name: 'Huda City Centre Metro', coords: [28.4595, 77.0727], type: 'metro' }
  ];

  const transitVehicles = [];

  // Generate Metro vehicles (10 lines)
  for (let i = 0; i < 10; i++) {
    const metro = metroLines[i];
    const location = delhiLocations[i];
    const routePath = [];

    for (let j = 0; j < 15; j++) {
      const offset = (j - 7) * 0.02;
      routePath.push([
        location.coords[0] + offset + (Math.random() - 0.5) * 0.005,
        location.coords[1] + offset * 0.5 + (Math.random() - 0.5) * 0.005
      ]);
    }

    transitVehicles.push({
      id: `metro-${i + 1}`,
      routeName: metro.name,
      location: location.coords,
      routePath,
      vehicleType: 'metro',
      status: ['active', 'arriving', 'departing'][Math.floor(Math.random() * 3)],
      speed: Math.floor(Math.random() * 30) + 40,
      currentStopIndex: Math.floor(Math.random() * 15),
      lineColor: metro.color,
      totalStations: metro.stations,
      nextStation: `Station ${Math.floor(Math.random() * metro.stations) + 1}`,
      estimatedArrival: `${Math.floor(Math.random() * 5) + 1} min`,
      crowdLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)]
    });
  }

  return transitVehicles;
}

function generateParkingData() {
  const delhiLocations = [
    { name: 'Connaught Place', coords: [28.6315, 77.2167] },
    { name: 'India Gate', coords: [28.6129, 77.2295] },
    { name: 'Red Fort', coords: [28.6562, 77.2410] },
    { name: 'Chandni Chowk', coords: [28.6506, 77.2303] },
    { name: 'AIIMS', coords: [28.5672, 77.2100] },
    { name: 'Hauz Khas', coords: [28.5494, 77.2001] },
    { name: 'Karol Bagh', coords: [28.6519, 77.1905] },
    { name: 'Rajouri Garden', coords: [28.6469, 77.1201] },
    { name: 'Dwarka', coords: [28.5921, 77.0460] },
    { name: 'Gurgaon Cyber City', coords: [28.4950, 77.0890] },
    { name: 'Noida City Centre', coords: [28.5744, 77.3564] },
    { name: 'Faridabad', coords: [28.4089, 77.3178] }
  ];

  const parkingLots = [];
  for (let i = 0; i < 12; i++) {
    const location = delhiLocations[i];
    parkingLots.push({
      id: i,
      name: `${location.name} Park & Ride`,
      location: [
        location.coords[0] + (Math.random() - 0.5) * 0.01,
        location.coords[1] + (Math.random() - 0.5) * 0.01
      ],
      capacity: faker.number.int({ min: 100, max: 500 }),
      availableSpots: faker.number.int({ min: 10, max: 100 })
    });
  }

  return parkingLots;
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      // Fetch real Arduino parking data from Firebase
      let arduinoParkingLots = [];
      try {
        const arduinoSnapshot = await db.collection('arduino-parking').get();
        arduinoParkingLots = arduinoSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            parkingLotId: data.parkingLotId,
            name: data.name,
            address: data.address,
            location: data.location || [28.5744, 77.3564], // Default location if not set
            capacity: data.totalSlots,
            availableSpots: data.availableSlots,
            hourlyRate: data.hourlyRate || 30,
            arduinoConnected: true,
            lastUpdated: data.lastUpdated
          };
        });
      } catch (error) {
        console.error('Error fetching Arduino data:', error);
      }

      // Generate simulated parking data
      const simulatedParkingLots = generateParkingData();
      
      // Merge Arduino data with simulated data (Arduino data comes first)
      const parkingLots = [...arduinoParkingLots, ...simulatedParkingLots];
      
      const transitVehicles = generateTransitData();

      res.status(200).json({
        parkingLots,
        transitVehicles,
        timestamp: new Date().toISOString(),
        dataMode: arduinoParkingLots.length > 0 ? 'hybrid' : 'simulated'
      });
    } catch (error) {
      console.error('Error generating transit data:', error);
      res.status(500).json({ error: 'Failed to generate transit data' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
