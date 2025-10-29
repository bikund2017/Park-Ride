import { db } from '../firebase.js';

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

      // If parkingLot data is not provided, fetch it from transit-data
      let parkingLotData = parkingLot || {};

      if (!parkingLot || Object.keys(parkingLot).length === 0) {
        try {
          // Import transit API to get parking lot details
          const { generateParkingLots } = await import('../services/transitAPI.js');
          const allParkingLots = generateParkingLots();
          const foundLot = allParkingLots.find(lot => lot.id === Number(parkingLotId));

          if (foundLot) {
            parkingLotData = {
              id: foundLot.id,
              name: foundLot.name,
              location: foundLot.location,
              capacity: foundLot.capacity,
              availableSpots: foundLot.availableSpots
            };
          }
        } catch (err) {
          console.error('Error fetching parking lot details:', err);
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
