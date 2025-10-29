import { db } from '../firebase.js';
import { faker } from '@faker-js/faker';

// Helper function to generate parking lot data (same as transit-data.js)
function getParkingLotById(lotId) {
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

  if (lotId < 0 || lotId >= delhiLocations.length) {
    return null;
  }

  const location = delhiLocations[lotId];
  // Use consistent seed for same ID
  faker.seed(lotId + 1000);

  return {
    id: lotId,
    name: `${location.name} Park & Ride`,
    location: [
      location.coords[0] + (Math.random() - 0.5) * 0.01,
      location.coords[1] + (Math.random() - 0.5) * 0.01
    ],
    capacity: faker.number.int({ min: 100, max: 500 }),
    availableSpots: faker.number.int({ min: 10, max: 100 })
  };
}

export default async function handler(req, res) {
  // Enable CORS
  const origin = req.headers.origin;
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000'];

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { parkingLotId, userId = 'anonymous', parkingLot } = req.body;

      if (parkingLotId === undefined || parkingLotId === null || parkingLotId === '') {
        return res.status(400).json({ message: 'Parking lot ID is required' });
      }

      // If parkingLot data is not provided, fetch it
      let parkingLotData = parkingLot || {};

      if (!parkingLot || Object.keys(parkingLot).length === 0) {
        const foundLot = getParkingLotById(Number(parkingLotId));
        if (foundLot) {
          parkingLotData = foundLot;
        }
      }

      const favorite = {
        id: `${userId}-${parkingLotId}`,
        userId,
        parkingLotId: Number(parkingLotId),
        parkingLot: parkingLotData,
        createdAt: new Date()
      };

      await db.collection('favorites').doc(favorite.id).set(favorite);

      res.status(200).json({ message: 'Added to favorites', favorite });
    } catch (error) {
      console.error('Error adding favorite:', error);
      res.status(500).json({ message: 'Error adding to favorites', error: error.message });
    }
  } else if (req.method === 'GET') {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      const favoritesSnapshot = await db.collection('favorites')
        .where('userId', '==', userId)
        .get();

      const favorites = [];
      favoritesSnapshot.forEach(doc => {
        favorites.push(doc.data());
      });

      favorites.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      res.status(200).json({ favorites });
    } catch (error) {
      console.error('Error fetching favorites:', error);
      res.status(500).json({ message: 'Error fetching favorites', error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
