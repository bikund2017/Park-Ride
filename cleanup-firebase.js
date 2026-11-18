import { db } from './firebase.js';

async function cleanupFirebase() {
  try {
    console.log('🔍 Fetching all Arduino parking entries from Firebase...');
    const snapshot = await db.collection('arduino-parking').get();
    
    console.log(`\n📊 Found ${snapshot.size} entries in Firebase:\n`);
    
    snapshot.forEach(doc => {
      console.log('ID:', doc.id);
      console.log('Data:', JSON.stringify(doc.data(), null, 2));
      console.log('---\n');
    });

    // Delete all entries except SAB_Mall_Parking
    console.log('🗑️  Cleaning up old/duplicate entries...\n');
    
    let deletedCount = 0;
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      // Keep only SAB_Mall_Parking and Noida_City_Centre_Parking (if valid)
      if (doc.id !== 'SAB_Mall_Parking' && doc.id !== 'Noida_City_Centre_Parking') {
        console.log(`❌ Deleting old entry: ${doc.id} (${data.name})`);
        await doc.ref.delete();
        deletedCount++;
      } else {
        console.log(`✅ Keeping: ${doc.id} (${data.name})`);
      }
    }

    console.log(`\n✅ Cleanup complete! Deleted ${deletedCount} entries.`);
    console.log('🔄 Your Arduino bridge will recreate the correct data on next update.\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning Firebase:', error);
    process.exit(1);
  }
}

cleanupFirebase();
