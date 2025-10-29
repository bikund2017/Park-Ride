export default function handler(req, res) {
  const health = {
    status: 'operational',
    timestamp: new Date().toISOString(),
    server: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version
    },
    apis: {
      delhiOTD: {
        configured: !!process.env.DELHI_TRANSIT_API_KEY,
        status: process.env.DELHI_TRANSIT_API_KEY ? 'ready' : 'missing_key'
      },
      dmrc: {
        configured: !!process.env.DMRC_API_KEY,
        status: process.env.DMRC_API_KEY ? 'ready' : 'pending_key'
      },
      dtc: {
        configured: !!process.env.DTC_API_KEY,
        status: process.env.DTC_API_KEY ? 'ready' : 'pending_key'
      },
      railways: {
        configured: !!(process.env.IRCTC_API_KEY || process.env.RAPIDAPI_KEY),
        status: (process.env.IRCTC_API_KEY || process.env.RAPIDAPI_KEY) ? 'ready' : 'pending_key'
      }
    },
    data: {
      transitVehicles: 19,
      parkingLots: 12,
      connectedClients: 0
    }
  };

  res.status(200).json(health);
}

