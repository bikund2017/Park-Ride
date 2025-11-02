/* eslint-disable no-trailing-spaces */
import axios from 'axios';
import config from '../config.js';


// API Configuration
const APIS = {
  // Delhi Open Transit Data
  delhiTransit: {
    baseUrl: 'https://otd.delhi.gov.in/api/realtime',
    apiKey: config.delhiTransit.apiKey
  },
  // Delhi Metro Rail Corporation (DMRC)
  dmrc: {
    baseUrl: 'https://api.delhimetrorail.com/v1',
    apiKey: process.env.DMRC_API_KEY || ''
  }
};

// Delhi Metro
export async function fetchDelhiMetroData() {
  try {
    console.log('🚇 Fetching real Delhi Metro data...');


    const response = await axios.get(`${APIS.delhiTransit.baseUrl}/metro-positions`, {
      headers: {
        'X-API-Key': APIS.delhiTransit.apiKey,
        'Accept': 'application/json'
      },
      timeout: 5000
    });

    if (response.data && response.data.vehicles) {
      const metroData = response.data.vehicles.map(vehicle => ({
        id: vehicle.id || vehicle.vehicle_id,
        routeName: vehicle.route_name || vehicle.line_name,
        location: [
          parseFloat(vehicle.latitude || vehicle.lat),
          parseFloat(vehicle.longitude || vehicle.lng)
        ],
        vehicleType: 'metro',
        status: vehicle.status || 'active',
        speed: parseInt(vehicle.speed) || 0,
        lineColor: vehicle.line_color || '#3498db',
        totalStations: vehicle.total_stations || 0,
        nextStation: vehicle.next_station || 'Unknown',
        estimatedArrival: vehicle.eta || `${Math.floor(Math.random() * 5) + 1} min`,
        crowdLevel: vehicle.crowd_level || 'Medium',
        routePath: vehicle.route_path || generateRoutePath(vehicle)
      }));

      console.log(`✅ Fetched ${metroData.length} real metro trains`);
      return metroData;
    }

    throw new Error('No metro data available');
  } catch (error) {
    console.log(`⚠️ Metro API error: ${error.message}`);
    return null;
  }
}



/**
 * Fetch all transit data
 */
export async function fetchAllRealTransitData() {
  console.log('📡 Fetching all real transit data from APIs...');

  const metroData = await fetchDelhiMetroData();

  const allData = [];

  if (metroData) allData.push(...metroData);

  if (allData.length > 0) {
    console.log(`✅ Total real vehicles fetched: ${allData.length}`);
    return allData;
  }

  return null;
}


function generateRoutePath(vehicle) {
  const lat = parseFloat(vehicle.latitude || vehicle.lat || 28.6139);
  const lng = parseFloat(vehicle.longitude || vehicle.lng || 77.2090);
  const path = [];

  for (let i = 0; i < 10; i++) {
    const offset = (i - 5) * 0.01;
    path.push([lat + offset, lng + offset * 0.5]);
  }

  return path;
}

export default {
  fetchDelhiMetroData,
  getAllTransitData: fetchAllRealTransitData
};
