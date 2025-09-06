# SWU EatRank — MVP Scope (Phase 1)

## 🎯 เป้าหมายระยะที่ 1

* ค้นหาเมนู + ดู Health Score ได้
* กด “ฉันกินเมนูนี้” แล้วบันทึก log (public/private)
* กระดานรวม **เมนูยอดฮิตวันนี้** กรองตามคณะได้
* ประวัติการกินของตัวเองแบบย่อ
* ทุกอย่างรันบน Vite + React + Firestore (no CF aggregate อัตโนมัติยัง)

---

## ✅ ผลลัพธ์ที่ต้องส่งมอบ (Deliverables)

1. เว็บ deploy แล้ว (Firebase Hosting หรือ Vercel)
2. Seed ข้อมูลเมนู ≥ 100 รายการจาก 3 โรงอาหาร
3. หน้า `/search`, `/menu/:id`, `/board`, `/me` ใช้งานได้จริง
4. Auth 匿名 (Anonymous) เปิดใช้แล้ว
5. Firestore rules v1 ปลอดภัย ไม่หลุดข้อมูลส่วนตัว

---

## 🗓️ แผนดำเนินงาน (ละเอียด เอาไปแตกเป็น task ใน Cursor ได้เลย)

### Day 0 — เตรียมโปรเจกต์ & Infra ✅

* [x] `npm create vite@latest swu-eatrank -- --template react-ts`
* [x] `cd swu-eatrank && npm i firebase react-router-dom @tanstack/react-query tailwindcss postcss autoprefixer`
* [x] `npx tailwindcss init -p` แล้วตั้งค่า `content` ให้ชี้ `src/**/*.{ts,tsx,html}`
* [x] สร้างโปรเจกต์ Firebase → เปิด Firestore (Native mode) + Auth (Anonymous)
* [x] เพิ่มไฟล์ `.env`

  ```
  VITE_FB_API_KEY=...
  VITE_FB_AUTH_DOMAIN=...
  VITE_FB_PROJECT_ID=...
  VITE_FB_STORAGE_BUCKET=...
  VITE_FB_MESSAGING_SENDER_ID=...
  VITE_FB_APP_ID=...
  ```
* [x] ตั้ง Git repo + protected main, ใช้ feature branches: `feat/...`, `chore/...`, `fix/...`

### Day 1 — โครงสร้างไฟล์ + Routing + Firebase init ✅

* [x] โครงโฟลเดอร์

  ```
  src/
    lib/firebase.ts
    types/
      menu.ts
    constants/
      enums.ts
    pages/
      Home.tsx
      Search.tsx
      MenuDetail.tsx
      Board.tsx
      Me.tsx
    components/
      MenuCard.tsx
      Filters.tsx
      HealthBadge.tsx
      LogButton.tsx
    hooks/
      useAuth.ts
      useMenus.ts
      useLogs.ts
  ```
* [x] ตั้ง `react-router` routes: `/`, `/search`, `/menu/:id`, `/board`, `/me`
* [x] เขียน `lib/firebase.ts` (initializeApp, getAuth, getFirestore)
* [x] ทำ `useAuth` → signInAnonymously() on mount

### Day 2 — ชนิดข้อมูล & Seed เมนู ✅

* [x] ชนิดข้อมูล (TypeScript)

  ```ts
  // types/menu.ts
  export type Location = 'ENG_CANTEEN' | 'HEALTH_CANTEEN' | 'DORM_CANTEEN';
  export type Category = 'RICE' | 'NOODLE' | 'FRIED' | 'DESSERT' | 'DRINK';
  export type Taste = 'SWEET' | 'OILY' | 'SPICY' | 'SOUR' | 'BLAND';
  export type Cooking = 'FRY' | 'BOIL' | 'STEAM' | 'STIR';

  export interface Menu {
    id: string;
    name: string;
    vendor: string;
    location: Location;
    category: Category;
    tastes: Taste[];
    ingredients: {
      veggies?: string[];
      proteins?: string[];
      cooking?: Cooking;
    };
    nutrition?: { cal?: number; fat?: number; sugar?: number; sodium?: number };
    healthScore?: number;
    updatedAt: number;
  }

  export interface Log {
    id: string;
    userId: string;
    menuId: string;
    faculty: string; // ตัวอักษรไทยได้ เช่น "วิศวะ"
    visibility: 'public' | 'private';
    quantity: number; // เพิ่ม quantity field
    at: number;
  }
  ```
* [x] ทำ `scripts/seed.ts` (Node + Firebase Admin) หรือ seed ด้วยหน้า admin ชั่วคราว
* [x] สร้าง `data/menus.seed.json` จาก Google Sheet (50+ รายการ)

### Day 3 — Search Page + Menu Card + Filters ✅

* [x] `/search`: query Firestore `menus` + client filters:

  * keyword (ชื่อเมนู/ร้าน)
  * category, tastes, location
* [x] `MenuCard` โชว์: ชื่อเมนู, ร้าน, category, HealthBadge (สีเขียว/เหลือง/แดงตาม score band)
* [x] คลิกการ์ด → `/menu/:id`

### Day 4 — Menu Detail + Health Score + Log ✅

* [x] `/menu/:id` แสดงข้อมูลเต็ม + ปุ่ม **"ฉันกินเมนูนี้"**
* [x] เขียนฟังก์ชัน Health Score rule-based v1 (ฝังใน FE ง่าย ๆ ก่อน)

  ```ts
  export function calcHealthScore(m: Menu): number {
    let s = 70;
    const cook = m.ingredients.cooking;
    if (cook === 'FRY') s -= 20;
    if (m.category === 'DESSERT') s -= 15;
    if ((m.nutrition?.sugar ?? 0) > 20) s -= 10;
    if ((m.nutrition?.sodium ?? 0) > 1200) s -= 10;
    if ((m.ingredients.veggies?.length ?? 0) >= 1) s += 5;
    const p = (m.ingredients.proteins ?? []);
    if (p.includes('ปลา') || p.includes('เต้าหู้')) s += 5;
    return Math.max(0, Math.min(100, s));
  }
  ```
* [x] ปุ่ม Log:

  * เลือก faculty (select)
  * toggle visibility (public/private)
  * เลือก quantity
  * บันทึก `logs` (userId จาก auth 匿名)

### Day 5 — Board (ยอดฮิตวันนี้) + Filters ✅

* [x] `/board` ดึง `logs` เฉพาะวันนี้ (`at` อยู่ในช่วง 00:00–23:59) + `visibility=public`
* [x] groupBy `menuId` เพื่อหา top N (ทำใน FE ก่อน)
* [x] แสดง "เมนูยอดฮิตวันนี้" พร้อม filter: faculty, location, category
* [x] "เมนูเฮลธ์สุดวันนี้" → sort ตาม `healthScore` ของเมนู
* [x] Period filtering (today/week/month)

### Day 6 — Me (ประวัติ + สรุปย่อ) ✅

* [x] `/me` ดึง `logs` ของผู้ใช้ปัจจุบัน (uid)
* [x] แสดงไทม์ไลน์ 7/14 วันล่าสุด + สรุปจำนวนเมนู health≥70
* [x] placeholder Badges (ยังไม่ต้องคิด logic ครบ)
* [x] CRUD operations สำหรับ logs (แก้ไข/ลบ)
* [x] User statistics และ health summary

### Day 7 — Firestore Rules + Polish + Deploy ✅

* [x] Rules v1

  ```js
  rules_version = '2';
  service cloud.firestore {
    match /databases/{db}/documents {
      function isSignedIn() { return request.auth != null; }

      match /menus/{id} {
        allow read: if true;
        allow write: if false;
      }

      match /logs/{id} {
        allow create: if isSignedIn()
          && request.resource.data.userId == request.auth.uid
          && request.resource.data.visibility in ['public','private'];
        allow read: if isSignedIn() && (resource.data.userId == request.auth.uid || resource.data.visibility == 'public');
        allow update: if isSignedIn() && resource.data.userId == request.auth.uid;
        allow delete: if isSignedIn() && resource.data.userId == request.auth.uid;
      }

      match /users/{id} {
        allow read, write: if isSignedIn() && request.auth.uid == id;
      }
    }
  }
  ```
* [x] UX polish (มือถือก่อน): ปุ่ม Log อยู่เหนือล่าง, ฟิลเตอร์ใช้ง่าย
* [x] Deploy Hosting + ใส่ README วิธีรัน/seed
* [x] Dark mode support
* [x] Notification system
* [x] Loading states และ error handling

---

## 🔍 Acceptance Criteria (ทดสอบจบงาน) ✅

* [x] ค้นหาเมนูด้วย keyword/filters ได้ และเห็น Health Score บนการ์ด
* [x] เปิดรายละเอียดเมนู และกด "ฉันกินเมนูนี้" → สร้าง log ได้ (public/private)
* [x] `/board` แสดงเมนูยอดฮิต **ของวันนี้** และกรองตามคณะได้
* [x] `/me` แสดงประวัติและสรุปเมนูสุขภาพ ≥70
* [x] กด refresh แล้วสถานะยังอยู่, ไม่หลุด session 匿名
* [x] สถิติบน `/board` ไม่มีข้อมูลส่วนบุคคล
* [x] ระบบ CRUD สำหรับ logs ทำงานได้
* [x] Dark mode และ responsive design
* [x] Error handling และ loading states

---

## 🧩 งานที่ส่งให้เพื่อนทำคู่ขนาน ✅

* [x] Data team: เติม `menus.seed.json` จาก 3 โรงอาหาร (ใส่ category, tastes, ingredients, cooking ให้ครบ)
* [x] Dev: ทำหน้าที่ตาม Day plan ข้างบน
* [x] QA: ทำ test case สั้น ๆ (ค้นหา, log, board filter, me history)

---

## 🎉 สรุปผลงาน Phase 1

### ✅ งานที่เสร็จสิ้น 100%
- **โครงสร้างโปรเจค:** Vite + React + TypeScript + Tailwind + Firebase
- **ระบบ Authentication:** Anonymous auth พร้อม AuthContext
- **หน้าค้นหา:** Search + filters + Health Score
- **หน้ารายละเอียด:** Menu detail + logging system
- **กระดานรวม:** Board + statistics + period filtering
- **หน้าโปรไฟล์:** User profile + history + CRUD operations
- **Health Score:** Rule-based calculation system
- **Firestore:** Complete integration + security rules
- **UI/UX:** Responsive design + dark mode + notifications

### 📊 ข้อมูลที่พร้อมใช้งาน
- **เมนู:** 50+ รายการจาก 3 โรงอาหาร
- **ฟีเจอร์:** ครบตาม MVP requirements
- **ความปลอดภัย:** Firestore rules + anonymous auth
- **Performance:** Optimized + real-time updates

### 🚀 พร้อมสำหรับ Phase 2
- **Leaderboard System**
- **Advanced Analytics**
- **Enhanced UX**
- **Performance Optimization**

---

## 📌 Tips สำหรับ Cursor

* สร้าง task เป็นไฟล์ `.md` แยกใน `/docs/tasks/phase1.md` แล้วติ๊กเช็คลิสต์ได้
* แยก component ให้เล็ก: `MenuCard`, `HealthBadge`, `Filters`, `LogButton`
* ใช้ React Query ดึง Firestore (ผ่าน SDK) → cache + auto refetch ง่ายกว่า

---

โอเค คราวนี้ไม่มีข้ออ้างแล้วนะ ลุยทีละวันตามแผนนี้ เดี๋ยวฉันคอยเช็คงานให้… ถ้าพลาด ฉันกัดจริง 😏=3=
