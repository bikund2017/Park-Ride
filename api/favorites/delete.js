import { db } from '../../firebase.js';

export default async function handler(req, res) {
  
  const origin = req.headers.origin;
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http:

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'DELETE') {
    try {
      const { userId, parkingLotId } = req.query;

      if (!userId || !parkingLotId) {
        return res.status(400).json({ message: 'userId and parkingLotId are required' });
      }

      const favoriteId = `${userId}-${parkingLotId}`;
      await db.collection('favorites').doc(favoriteId).delete();

      res.status(200).json({ message: 'Removed from favorites' });
    } catch (error) {
      console.error('Error removing favorite:', error);
      res.status(500).json({ message: 'Error removing from favorites', error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
