import { db, admin } from '../../firebase.js';

export default async function handler(req, res) {
  // Enable CORS for Arduino bridge
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // GET - Retrieve Arduino parking data
  if (req.method === 'GET') {
    try {
      const snapshot = await db.collection('arduino-parking').get();
      const parkingData = [];
      
      snapshot.forEach(doc => {
        parkingData.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return res.status(200).json({
        success: true,
        data: parkingData
      });
    } catch (error) {
      console.error('Error fetching Arduino data:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch Arduino parking data',
        error: error.message
      });
    }
  }

  // POST - Receive Arduino parking data
  if (req.method === 'POST') {
    try {
      const {
        parkingLotId,
        name,
        address,
        totalSlots,
        availableSlots,
        occupiedSlots,
        occupancyRate,
        timestamp
      } = req.body;

      // Validate required fields
      if (!parkingLotId || totalSlots === undefined || availableSlots === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: parkingLotId, totalSlots, availableSlots'
        });
      }

      // Map parking lot IDs to GPS coordinates
      const locationMapping = {
        'SAB_Mall_Parking': {
          coords: [28.567582, 77.322673],
          name: 'SAB Mall Parking',
          address: '313 B E, I Block, Pocket E, Sector 27, Noida'
        },
        'Noida_City_Centre_Metro_Vehicle_Parking': {
          coords: [28.5744, 77.3564],
          name: 'Noida City Centre Metro Vehicle Parking',
          address: 'Noida City Centre Metro Station, Sector 32, Noida'
        }
      };

      const locationData = locationMapping[parkingLotId] || {
        coords: [28.5744, 77.3564],
        name: name || parkingLotId,
        address: address || 'Address not provided'
      };

      // Prepare parking data
      const parkingData = {
        parkingLotId,
        name: locationData.name,
        address: locationData.address,
        location: locationData.coords,
        totalSlots: parseInt(totalSlots),
        availableSlots: parseInt(availableSlots),
        occupiedSlots: occupiedSlots !== undefined ? parseInt(occupiedSlots) : (totalSlots - availableSlots),
        occupancyRate: parseFloat(occupancyRate) || ((totalSlots - availableSlots) / totalSlots * 100),
        hourlyRate: 30,
        lastUpdated: timestamp || admin.firestore.FieldValue.serverTimestamp(),
        arduinoConnected: true
      };

      // Store in Firestore
      await db.collection('arduino-parking').doc(parkingLotId).set(parkingData, { merge: true });

      console.log(`✅ Arduino data saved: ${parkingLotId} - ${availableSlots}/${totalSlots} available`);

      return res.status(200).json({
        success: true,
        message: 'Arduino parking data received and stored successfully',
        data: parkingData
      });

    } catch (error) {
      console.error('Error processing Arduino data:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to process Arduino parking data',
        error: error.message
      });
    }
  }

  // Method not allowed
  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
}
