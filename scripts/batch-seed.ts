import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, writeBatch } from 'firebase/firestore';

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Simple test data
const testMenus = [
  {
    id: 'test_001',
    name: 'ข้าวกะเพราไก่',
    vendor: 'ร้านกะเพราแม่',
    location: 'ENG_CANTEEN',
    category: 'RICE',
    tastes: ['SPICY', 'OILY'],
    ingredients: {
      veggies: ['กะเพรา', 'พริก'],
      proteins: ['ไก่'],
      cooking: 'STIR'
    },
    nutrition: {
      cal: 450,
      fat: 15,
      sugar: 5,
      sodium: 800
    },
    updatedAt: Date.now()
  },
  {
    id: 'test_002',
    name: 'ข้าวผัดกุ้ง',
    vendor: 'ร้านข้าวผัดป้า',
    location: 'ENG_CANTEEN',
    category: 'RICE',
    tastes: ['OILY', 'BLAND'],
    ingredients: {
      veggies: ['แครอท', 'ถั่วลันเตา'],
      proteins: ['กุ้ง'],
      cooking: 'STIR'
    },
    nutrition: {
      cal: 380,
      fat: 12,
      sugar: 3,
      sodium: 650
    },
    updatedAt: Date.now()
  }
];

async function batchSeedMenus() {
  console.log('🚀 เริ่มต้น batch seed ข้อมูลเมนูทดสอบ...');
  
  try {
    const batch = writeBatch(db);
    const menusRef = collection(db, 'menus');
    
    for (const menu of testMenus) {
      const menuData = {
        name: menu.name,
        vendor: menu.vendor,
        location: menu.location,
        category: menu.category,
        tastes: menu.tastes,
        ingredients: menu.ingredients,
        nutrition: menu.nutrition,
        updatedAt: menu.updatedAt
      };
      
      const docRef = doc(menusRef, menu.id);
      batch.set(docRef, menuData);
      console.log(`📝 เพิ่มเมนูใน batch: ${menu.name}`);
    }
    
    await batch.commit();
    console.log(`🎉 Batch seed เสร็จสิ้น! เพิ่มเมนู ${testMenus.length} รายการ`);
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการ batch seed:', error);
  }
}

// Run seed function
batchSeedMenus();
