import { db } from '../firebase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
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
      
      const responseData = { reports, total: reports.length };
      
      res.status(200).json(responseData);
    } catch (error) {
      console.error('Error retrieving reports:', error);
      res.status(500).json({ message: 'Error retrieving reports' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

