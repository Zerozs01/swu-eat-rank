import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { firebaseConfig } from '../src/config/firebase';
import menusData from '../src/data/menus.seed.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedMenus() {
  console.log('🚀 เริ่มต้น seed ข้อมูลเมนู...');
  
  try {
    const menusRef = collection(db, 'menus');
    
    for (const menu of menusData) {
      await setDoc(doc(menusRef, menu.id), {
        ...menu,
        updatedAt: Date.now()
      });
      console.log(`✅ เพิ่มเมนู: ${menu.name}`);
    }
    
    console.log(`🎉 Seed เสร็จสิ้น! เพิ่มเมนู ${menusData.length} รายการ`);
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการ seed:', error);
  }
}

// Run seed function
seedMenus();
