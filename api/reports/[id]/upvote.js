import { db } from '../../../firebase.js';

export default async function handler(req, res) {
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: 'Report ID is required' });
    }

    const reportRef = db.collection('reports').doc(id);
    const reportDoc = await reportRef.get();

    if (!reportDoc.exists) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const reportData = reportDoc.data();
    const currentUpvotes = reportData.upvotes || 0;
    const newUpvotes = currentUpvotes + 1;

    await reportRef.update({
      upvotes: newUpvotes,
      lastUpvoted: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      upvotes: newUpvotes,
      message: 'Report upvoted successfully'
    });

  } catch (error) {
    console.error('Error upvoting report:', error);
    return res.status(500).json({
      message: 'Error upvoting report',
      error: error.message
    });
  }
}
