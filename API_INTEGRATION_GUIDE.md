# 🔌 Real API Integration Guide
## Park & Ride+ Delhi NCR - Live Data Sources

This guide explains how to integrate real-time data from Delhi's transit systems.

---

## 📊 Current Status

### ✅ Implemented Features
- Real API integration service (`services/transitAPI.js`)
- Automatic fallback to simulated data
- Rate limiting and error handling
- Multi-source data aggregation

### 🔄 Data Sources Status
| Source | Status | Data Type |
|--------|--------|-----------|
| Delhi OTD API | ⚠️ Configured | Metro, Bus |
| DMRC API | ⏳ Pending Key | Metro |
| DTC API | ⏳ Pending Key | Bus |
| Indian Railways | ⏳ Pending Key | Train |
| Parking Sensors | ⏳ Pending Setup | Parking |

---

## 🔑 How to Get Real API Keys

### 1. Delhi Open Transit Data (OTD)
**Website:** https://otd.delhi.gov.in/

**Steps:**
1. Visit the Delhi Open Transit Data portal
2. Register for a developer account
3. Request API access
4. Copy your API key
5. Add to `.env`: `DELHI_TRANSIT_API_KEY=your_key_here`

**Endpoints Available:**
- `/api/realtime/metro-positions` - Live metro train locations
- `/api/realtime/bus-positions` - Live bus locations
- `/api/realtime/parking-availability` - Parking lot status

---

### 2. Delhi Metro Rail Corporation (DMRC)
**Website:** https://www.delhimetrorail.com/

**Steps:**
1. Contact DMRC IT Department: it@dmrc.org
2. Request developer API access
3. Submit your project details
4. Receive API credentials
5. Add to `.env`: `DMRC_API_KEY=your_key_here`

**Data Available:**
- Real-time train positions
- Station crowd levels
- Service disruptions
- Estimated arrival times

---

### 3. Delhi Transport Corporation (DTC)
**Website:** https://otis.dimts.in/

**OTIS (Online Tracking Information System)**

**Steps:**
1. Visit DIMTS (Delhi Integrated Multi-Modal Transit System)
2. Register at https://otis.dimts.in/register
3. Request API access for developers
4. Add to `.env`: `DTC_API_KEY=your_key_here`

**Data Available:**
- Live bus GPS locations
- Route information
- Bus stop ETAs
- AC/Non-AC bus status

---

### 4. Indian Railways
**Option A: IRCTC API**
**Website:** https://www.irctc.co.in/

**Steps:**
1. Register at IRCTC
2. Apply for API access through CRIS (Centre for Railway Information Systems)
3. Email: cris@railnet.gov.in
4. Add to `.env`: `IRCTC_API_KEY=your_key_here`

**Option B: RapidAPI (Easier)**
**Website:** https://rapidapi.com/

**Steps:**
1. Sign up at RapidAPI
2. Subscribe to "Indian Railway API"
3. Get your RapidAPI key
4. Add to `.env`: `RAPIDAPI_KEY=your_key_here`

**Data Available:**
- Live train running status
- Platform information
- Delay information
- Coach composition

---

### 5. Smart Parking (IoT Sensors)
**For Real Parking Data:**

**Option A: Municipal APIs**
Contact Delhi Municipal Corporations:
- NDMC: https://www.ndmc.gov.in/
- MCD: https://www.mcdonline.nic.in/

**Option B: Private Parking Operators**
- Park+ API: https://www.parkplus.io/
- ParkEasy API: https://parkeasy.in/

**Option C: Build Your Own IoT System**
1. Install ultrasonic/IR sensors in parking lots
2. Connect to Arduino/Raspberry Pi
3. Send data to your server via MQTT/HTTP
4. Configure endpoint in `.env`

---

## 🚀 Quick Setup

### Step 1: Copy Environment File
```bash
cp .env.example .env
```

### Step 2: Add Your API Keys
Edit `.env` and add your keys:
```env
DELHI_TRANSIT_API_KEY=your_actual_key
DMRC_API_KEY=your_actual_key
DTC_API_KEY=your_actual_key
IRCTC_API_KEY=your_actual_key
```

### Step 3: Restart Server
```bash
npm start
```

### Step 4: Monitor Logs
Watch for:
```
✅ SUCCESS! Fetched X REAL transit vehicles
   - Metro: X
   - Bus: X
   - Train: X
```

If you see:
```
📊 Using simulated data as fallback
```
Then API keys need to be configured.

---

## 🔧 Testing APIs

### Test Individual APIs

**Test Delhi Metro:**
```bash
curl -H "X-API-Key: YOUR_KEY" \
  https://otd.delhi.gov.in/api/realtime/metro-positions
```

**Test DTC Bus:**
```bash
curl -H "Authorization: Bearer YOUR_KEY" \
  https://otis.dimts.in/api/v1/buses/live
```

**Test Indian Railways:**
```bash
curl https://enquiry.indianrail.gov.in/ntes/api/trains/live/NDLS
```

---

## 📡 API Response Formats

### Metro API Response
```json
{
  "vehicles": [
    {
      "id": "metro-001",
      "line_name": "Blue Line",
      "latitude": 28.6315,
      "longitude": 77.2167,
      "speed": 45,
      "status": "active",
      "next_station": "Rajiv Chowk",
      "eta": "2 min"
    }
  ]
}
```

### Bus API Response
```json
{
  "buses": [
    {
      "bus_id": "DTC-764-01",
      "route_number": "764",
      "latitude": 28.6692,
      "longitude": 77.2289,
      "speed": 25,
      "next_stop": "ISBT Kashmere Gate",
      "ac_available": true
    }
  ]
}
```

### Train API Response
```json
{
  "trains": [
    {
      "train_number": "12301",
      "train_name": "Rajdhani Express",
      "platform": "2",
      "scheduled_time": "16:30",
      "delay": 15,
      "status": "arriving"
    }
  ]
}
```

---

## 🛠️ Troubleshooting

### Issue: "API key not configured"
**Solution:** Add API key to `.env` file

### Issue: "API timeout"
**Solution:** Check internet connection and API service status

### Issue: "No data available"
**Solution:** Verify API endpoint URLs and authentication

### Issue: "Rate limit exceeded"
**Solution:** Reduce API call frequency in `server.js`

---

## 📞 Support Contacts

### Delhi Government
- **Delhi Transport Department:** transport.delhi@nic.in
- **DIMTS:** info@dimts.in

### Delhi Metro
- **DMRC IT:** it@dmrc.org
- **Customer Care:** 155370

### Indian Railways
- **CRIS:** cris@railnet.gov.in
- **Enquiry:** 139

---

## 🔐 Security Best Practices

1. **Never commit API keys to Git**
   - Add `.env` to `.gitignore`
   - Use environment variables

2. **Rotate keys regularly**
   - Change keys every 90 days
   - Monitor for unauthorized usage

3. **Use HTTPS only**
   - All API calls use secure connections
   - Validate SSL certificates

4. **Rate limiting**
   - Implement request throttling
   - Cache responses when possible

---

## 📈 Next Steps

1. **Get API Keys** - Contact providers listed above
2. **Test APIs** - Use curl commands to verify
3. **Update .env** - Add your keys
4. **Monitor Logs** - Check for real data
5. **Optimize** - Adjust refresh rates and caching

---

## 🎯 Expected Results

Once all APIs are configured, you'll see:

- **10 Real Metro Trains** from DMRC/OTD
- **5 Real DTC Buses** from OTIS
- **4 Real Trains** from Indian Railways
- **12 Real Parking Lots** from IoT sensors

Total: **19+ Real-time Transit Vehicles** with live updates every 3 seconds!

---

## 📝 Notes

- Some APIs may require approval (1-7 days)
- Government APIs are often free for non-commercial use
- RapidAPI offers paid plans with higher limits
- IoT parking sensors require physical installation

---

**Last Updated:** October 2025
**Version:** 2.0
**Contact:** support@parkandride.delhi
