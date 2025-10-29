import { db } from '../firebase.js';

export default async function handler(req, res) {
  
  const origin = req.headers.origin;
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['http:
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const { category, search, limit = 100 } = req.query;

      let query = db.collection('reports');

      if (category && category !== 'all') {
        query = query.where('category', '==', category);
      }

      query = query.orderBy('timestamp', 'desc').limit(parseInt(limit));

      const reportsSnapshot = await query.get();

      let reports = [];
      reportsSnapshot.forEach(doc => {
        const data = doc.data();
        reports.push({
          id: doc.id,
          location: data.location,
          description: data.description,
          category: data.category || 'general',
          imageUrl: data.imageUrl || null,
          timestamp: data.timestamp?.toDate?.() || data.timestamp,
          submittedAt: data.timestamp?.toDate?.()?.toLocaleString() || new Date(data.timestamp).toLocaleString(),
          upvotes: data.upvotes || 0,
          resolved: data.resolved || false,
          clientInfo: data.clientInfo || {}
        });
      });

      if (search && search.trim()) {
        const searchLower = search.toLowerCase();
        reports = reports.filter(report =>
          report.description.toLowerCase().includes(searchLower) ||
          report.category.toLowerCase().includes(searchLower)
        );
      }

      res.status(200).json({ reports, total: reports.length });
    } catch (error) {
      console.error('Error retrieving reports:', error);
      res.status(500).json({ message: 'Error retrieving reports', error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
