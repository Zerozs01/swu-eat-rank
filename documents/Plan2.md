
# SWU EatRank — Plan2 (Post-MVP hardening & Phase-2 prep)

## TL;DR
- 🔧 แก้จุดเสี่ยง: seed script หาย, Firestore Rules ขัดกับโค้ด, config Firebase แข็งทื่อ (hard-coded), index/query ยังไม่พร้อม board, storageBucket ผิดโดเมน
- 🚀 เป้าหมาย 2 สัปดาห์: เสถียร + deploy จริง + เตรียม aggregate รายวัน
- 🧱 ลำดับทำงาน: Now → Next → Later (ตัดสินใจง่าย)

---

## 1) ภาพรวมสถานะที่ตรวจจากโปรเจกต์
- Codebase: Vite + React + TS + Tailwind + Firebase (Auth/Firestore/Analytics) พร้อมหน้า Search/Detail/Board/Me ครบ
- เอกสาร: `documents/Readme.md`, `Plan.md`, `Mvp_scope(phase1).md`, `FIREBASE_SETUP.md`, `FIRESTORE_SETUP.md` ครบและชัด
- Seed data: มี `src/data/menus.seed.json` **แต่** ไม่มี `scripts/seed.ts` จริง (package.json ชี้ไปที่ไฟล์ที่ไม่มี)
- Firestore Rules: `logs` disallow update/delete แต่โค้ด `useLogs.ts` เรียก `updateDoc`/`deleteDoc` → ขัดกัน
- Config: `src/config/firebase.ts` ใส่คีย์ตรง ๆ + `storageBucket` เป็น `firebasestorage.app` (ปกติควร `appspot.com`)
- Indexes: ยังไม่กำหนด composite index สำหรับ Board (เช่น filter ตามวัน/คณะ/visibility)

---

## 2) สิ่งที่ต้องแก้ด่วน (NOW)

### 2.1 Seed script ให้ใช้งานได้จริง
- แก้ `package.json` หรือสร้าง `scripts/seed.ts` ให้ตรงทาง:
  - ทางเลือก A: เปลี่ยนสคริปต์เป็น `tsx src/scripts/seed.ts` แล้ววางไฟล์ไว้ใน `src/scripts/seed.ts`
  - ทางเลือก B: สร้างโฟลเดอร์ `scripts/seed.ts` ให้ตรงตามเดิม
- ตัวอย่าง `src/scripts/seed.ts` (ย่อ):
  ```ts
  import { initializeApp } from 'firebase/app';
  import { getFirestore, doc, setDoc } from 'firebase/firestore';
  import menus from '../data/menus.seed.json';
  const app = initializeApp({
    apiKey: import.meta.env.VITE_FB_API_KEY,
    authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FB_PROJECT_ID,
  });
  const db = getFirestore(app);
  await Promise.all(menus.map((m: any) => setDoc(doc(db, 'menus', m.id), m)));
  console.log('Seed done');
````

* เพิ่ม `.env.example` ระบุคีย์ที่ต้องใช้ และอัปเดต README เรื่องการ seed

### 2.2 ย้าย Firebase config ออกจากซอร์ส

* แทนที่ `src/config/firebase.ts` ให้ดึงจาก `import.meta.env` ทั้งหมด
* เปลี่ยน `storageBucket` เป็น `*.appspot.com` ให้ถูกต้องตามโปรเจกต์จริง
* เพิ่มการตรวจ undefined ของ env (fail fast)

### 2.3 แก้ Firestore Rules ให้ตรงโค้ด

* ปัจจุบัน `logs` ไม่อนุญาต update/delete แต่โค้ดมี `updateDoc/deleteDoc`
* ปรับกฎโดยยึด “เจ้าของแก้/ลบของตัวเองเท่านั้น”:

  ```js
  match /logs/{id} {
    allow create: if isSignedIn()
      && request.resource.data.userId == request.auth.uid
      && request.resource.data.visibility in ['public','private'];
    allow read: if isSignedIn() && resource.data.userId == request.auth.uid;
    allow update, delete: if isSignedIn() && resource.data.userId == request.auth.uid;
  }
  ```
* ถ้าอยากกัน field สำคัญ: จำกัดเฉพาะบางฟิลด์เวลาอัปเดต (optional)

### 2.4 เตรียม Indexes สำหรับ Board

* กรณี query ยอดฮิต “วันนี้” + คณะ + เฉพาะ `visibility=public`
* แนะนำเก็บ timestamp ใน `logs.at` (seconds/ms) และตั้ง index (ตัวอย่าง):

  * Collection: `logs`
  * Fields: `visibility ASC`, `faculty ASC`, `at DESC`
* เพิ่มใน `firestore.indexes.json` แล้ว `firebase deploy --only firestore:indexes`

### 2.5 ตรวจแพ็กเกจ/เวอร์ชันให้เข้ากัน

* React 19 + React Router 7 + Vite 7 → ผ่าน แต่เช็ค breaking changes ของ Router hooks ที่ใช้อยู่
* Tailwind v3 ok
* Firebase JS SDK v12 ok

---

## 3) งานเสริมความเสถียร (NEXT)

### 3.1 Error & Empty States

* ทุกหน้าให้มี state: loading / empty / error (ตอนนี้บางจุดยังไม่ชัด)
* สร้าง `components/Empty.tsx`, `components/ErrorBoundary.tsx`

### 3.2 React Query Persist & Cache

* เปิด persist (localStorage) สำหรับรายการเมนู และคิวรีบอร์ด → ลดอ่าน Firestore ซ้ำ
* ตั้ง `staleTime`/`gcTime` ให้เหมาะกับ “ค่าเปลี่ยนไม่ถี่มาก”

### 3.3 UX polish ที่ระบุใน docs

* ปุ่ม “ฉันกินเมนูนี้” อยู่เหนือ fold จริง
* ฟิลเตอร์ `/board` แตะครั้งเดียวติด (ไม่ต้องปิด modal)
* สี/label HealthScore สม่ำเสมอ และเข้าถึงได้ (contrast)

### 3.4 Analytics & Events

* ติดตั้ง event สำคัญ: `search_performed`, `menu_logged`, `board_filtered`, `visibility_switched`
* ทำรายงานสั้น ๆ ใน `documents/ANALYTICS_EVENTS.md`

### 3.5 PWA & Offline-first (เบื้องต้น)

* เพิ่ม `vite-plugin-pwa` แบบ cache หน้า/asset พื้นฐาน
* อนาคตค่อย cache เมนู + queue write สำหรับ log ตอนออฟไลน์

---

## 4) Phase 2 เตรียมของหนัก (LATER)

### 4.1 Aggregate รายวัน (Cloud Functions / Scheduled)

* Job ทุก 15 นาที/ชั่วโมง: รวม `public logs` → `aggregates/day_faculty`
* สคีมา:

  ```json
  { "date":"2025-09-06", "faculty":"ENG", "topMenus":[{menuId,count}], "healthAvg": 74.2 }
  ```
* หน้า Board อ่านจาก `aggregates` เมื่อมี, fallback อ่านตรงจาก `logs`

### 4.2 Health Score แม่นขึ้น

* map เมนูยอดฮิตกับฐานข้อมูลโภชนาการมาตรฐาน (ภายหลัง)
* เพิ่ม rule: น้ำตาล/โซเดียม/วิธีปรุง มีน้ำหนักชัดเจน + unit test

### 4.3 Recommendation/Swap

* จากรสนิยม + งบ + เป้าหมายสุขภาพ → แนะนำเมนูทางเลือก

### 4.4 Export Dashboard (ภาควิชา)

* ทำหน้า read-only พร้อมดาวน์โหลด CSV (เฉพาะสถิติโดยไม่ระบุตัวตน)

---

## 5) Security & Privacy

* Auth: เริ่มที่ Anonymous, เปิด Google Sign-In เฉพาะแอดมินทดสอบ
* Rules: principle of least privilege (เมนู read-only, log เป็นของผู้ใช้)
* Privacy UI: toggle `public/private` ต่อครั้งเสมอ + คำอธิบายสั้น ๆ
* ลบคีย์จริงออกจาก repo (ถ้าเคย push แล้ว ให้ rotate keys)

---

## 6) QA Checklist ก่อนปล่อย

* [ ] Seed ผ่าน และเมนู ≥ 100 รายการ
* [ ] สร้าง/ลบ/แก้ log ของตัวเองได้ตามกฎ
* [ ] Board กรองตามคณะ + “วันนี้” ทำงานเร็ว (เช็ก index hit)
* [ ] Lighthouse (mobile) ≥ 90 / a11y ≥ 95
* [ ] Error/Empty States ครบทุก route
* [ ] PWA installable + basic offline
* [ ] Analytics event ยิงครบตามแผน

---

## 7) งานที่ต้องแก้ในโค้ดทันที (Patch list)

1. `package.json`:

```diff
- "seed": "tsx scripts/seed.ts"
+ "seed": "tsx src/scripts/seed.ts"
```

2. `src/config/firebase.ts` → ใช้ env:

```ts
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET, // *.appspot.com
  messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FB_APP_ID,
};
```

3. Firestore Rules (`firestore.rules`):

```diff
-   allow update, delete: if false;
+   allow update, delete: if isSignedIn() && resource.data.userId == request.auth.uid;
```

4. สร้าง `firestore.indexes.json` ให้มี composite index: (ตัวอย่างโครง)

```json
{
  "indexes": [
    {
      "collectionGroup": "logs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "visibility", "mode": "ASCENDING" },
        { "fieldPath": "faculty", "mode": "ASCENDING" },
        { "fieldPath": "at", "mode": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

---

## 8) ไทม์ไลน์แนะนำ

**สัปดาห์นี้**

* แพตช์ 2.1–2.4 + ล้างคีย์ออก repo + deploy preview
* ใส่ Error/Empty states + basic analytics

**สัปดาห์หน้า**

* React Query persist + PWA เบื้องต้น
* เตรียม Cloud Functions (aggregate) + อินเด็กซ์เพิ่มเติมถ้าจำเป็น
* รอบ QA + Lighthouse + เอกสาร ANAYLTICS\_EVENTS.md

---

## 9) เอกสารที่ควรเพิ่ม

* `.env.example`
* `documents/ANALYTICS_EVENTS.md`
* `documents/DEPLOY_CHECKLIST.md`
* `documents/SECURITY_PRIVACY.md`

```

---

### หมายเหตุที่ฉัน “กัด” เพิ่มให้
- คีย์ Firebase ที่นายดันวางคาไว้ใน repo น่ะ เอาออกซะ แล้ว rotate ด้วย เข้าใจ? (จริง ๆ ก็ยังไม่อันตรายถ้าเป็น public rules + โปรเจกต์ทดลอง แต่ให้ทำให้ถูก) 😤
- `useLogs.ts` เรียก update/delete แต่ rules เดิมบล็อก—ที่มัน “ดูเหมือนใช้ได้” เพราะยังไม่ชนเงื่อนไขในบาง flow เท่านั้น แก้ตามแพตช์ด้านบน
- ถ้าบอร์ดจะ “ไว” แบบไม่ควันขึ้นหัว ใช้ **aggregate** + index ให้ถูก แล้ว cache ด้วย React Query persist

จะให้ฉันร่างไฟล์ `seed.ts`, `DEPLOY_CHECKLIST.md` หรือเคาะ rules/indexes ให้เข้าที่แบบ copy-paste ก็พูดมา เดี๋ยวจัด…ก็แค่นี้เอง =3=

