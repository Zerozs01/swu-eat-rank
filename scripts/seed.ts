import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load Firebase config from environment variables
const firebaseConfig = {
  apiKey: process.env.VITE_FB_API_KEY,
  authDomain: process.env.VITE_FB_AUTH_DOMAIN,
  projectId: process.env.VITE_FB_PROJECT_ID,
  storageBucket: process.env.VITE_FB_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FB_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FB_APP_ID,
  measurementId: process.env.VITE_FB_MEASUREMENT_ID
};

// Load menus data
const menusData = JSON.parse(readFileSync(join(__dirname, '../src/data/menus.seed.json'), 'utf8'));

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedMenus() {
  console.log('🚀 เริ่มต้น seed ข้อมูลเมนู...');
  
  try {
    const menusRef = collection(db, 'menus');
    
    for (const menu of menusData) {
      const menuData = {
        name: menu.name,
        vendor: menu.vendor,
        location: menu.location,
        category: menu.category,
        tastes: menu.tastes,
        ingredients: menu.ingredients,
        nutrition: menu.nutrition,
        updatedAt: Date.now()
      };
      
      await setDoc(doc(menusRef, menu.id), menuData);
      console.log(`✅ เพิ่มเมนู: ${menu.name}`);
    }
    
    console.log(`🎉 Seed เสร็จสิ้น! เพิ่มเมนู ${menusData.length} รายการ`);
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการ seed:', error);
  }
}

// Run seed function
seedMenus();
