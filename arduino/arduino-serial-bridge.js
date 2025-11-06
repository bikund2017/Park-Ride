/* eslint-disable no-trailing-spaces */
import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import axios from 'axios';

const CONFIG = {
  // Serial Port
  serialPort: '/dev/ttyUSB0',
  baudRate: 9600,

  serverUrl: 'https://park-ride-new1.vercel.app',  
  apiEndpoint: '/api/arduino/parking',

  maxRetries: 3,
  retryDelay: 2000  // 2 sec
};

let port = null;
let parser = null;
let jsonBuffer = '';
let isCollectingJSON = false;


function initSerialPort() {
  console.log('🔌 Initializing Serial Connection...');
  console.log(`📡 Port: ${CONFIG.serialPort}`);
  console.log(`⚡ Baud Rate: ${CONFIG.baudRate}`);

  port = new SerialPort({
    path: CONFIG.serialPort,
    baudRate: CONFIG.baudRate
  });

  parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

  port.on('open', () => {
    console.log('✅ Serial Port Opened Successfully!');
    console.log('📊 Listening for Arduino data...\n');
  });

  port.on('error', (err) => {
    console.error('❌ Serial Port Error:', err.message);
    console.log('\n💡 Tips:');
    console.log('  - Check if Arduino is connected');
    console.log('  - Verify the COM port (use Arduino IDE to find it)');
    console.log('  - Close Arduino Serial Monitor if open');
    console.log('  - On Linux/Mac, you may need permissions: sudo chmod 666 /dev/ttyACM0\n');
  });

  parser.on('data', handleSerialData);
}

function handleSerialData(line) {
  const trimmedLine = line.trim();
  
  if (trimmedLine === 'JSON_START') {
    isCollectingJSON = true;
    jsonBuffer = '';
    return;
  }
  
  if (trimmedLine === 'JSON_END') {
    if (isCollectingJSON && jsonBuffer) {
      processJSONData(jsonBuffer);
    }
    isCollectingJSON = false;
    jsonBuffer = '';
    return;
  }

  if (isCollectingJSON) {
    jsonBuffer += trimmedLine;
  } else {
    console.log(`[Arduino] ${trimmedLine}`);
  }
}

function processJSONData(jsonString) {
  try {
    const parkingData = JSON.parse(jsonString);
    
    console.log('\n📦 Received Parking Data:');
    console.log(`   Parking Lot: ${parkingData.parkingLotId}`);
    console.log(`   Available: ${parkingData.availableSlots} / ${parkingData.totalSlots}`);
    console.log(`   Occupancy: ${parkingData.occupancyRate.toFixed(1)}%`);
    
    // Send to server
    sendToServer(parkingData);
    
  } catch (error) {
    console.error('❌ JSON Parse Error:', error.message);
    console.error('   Raw data:', jsonString);
  }
}

// Send Data to Server 
async function sendToServer(data, retryCount = 0) {
  const url = `${CONFIG.serverUrl}${CONFIG.apiEndpoint}`;
  
  try {
    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000  // 5 second 
    });
    
    if (response.data.success) {
      console.log('✅ Data sent to server successfully!');
      console.log(`   Response: ${response.data.message}\n`);
    } else {
      console.log('⚠️  Server responded with error:', response.data.message);
    }
    
  } catch (error) {
    console.error('❌ Failed to send data to server:');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('   Server is not running or unreachable');
      console.error(`   URL: ${url}`);
      console.error('   💡 Make sure your server is running (npm start)');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('   Request timed out');
    } else {
      console.error('   Error:', error.message);
    }
  
    if (retryCount < CONFIG.maxRetries) {
      console.log(`   🔄 Retrying... (${retryCount + 1}/${CONFIG.maxRetries})`);
      setTimeout(() => {
        sendToServer(data, retryCount + 1);
      }, CONFIG.retryDelay);
    } else {
      console.log('   ⏭️  Max retries reached. Skipping this update.\n');
    }
  }
}

async function listSerialPorts() {
  const ports = await SerialPort.list();
  
  console.log('\n📋 Available Serial Ports:');
  if (ports.length === 0) {
    console.log('   No serial ports found!');
    console.log('   💡 Make sure Arduino is connected via USB\n');
    return;
  }
  
  ports.forEach((port, index) => {
    console.log(`   ${index + 1}. ${port.path}`);
    if (port.manufacturer) {
      console.log(`      Manufacturer: ${port.manufacturer}`);
    }
    if (port.serialNumber) {
      console.log(`      Serial: ${port.serialNumber}`);
    }
  });
  console.log('');
}

process.on('SIGINT', () => {
  console.log('\n👋 Shutting down Serial Bridge...');
  if (port && port.isOpen) {
    port.close(() => {
      console.log('✅ Serial port closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

async function main() {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║   Arduino Serial Bridge - Smart Parking System    ║');
  console.log('╚════════════════════════════════════════════════════╝\n');
  
  await listSerialPorts();
  
  initSerialPort();
}

main();

export { CONFIG };
