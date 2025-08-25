# Firebase Setup Guide

## ขั้นตอนการตั้งค่า Firebase

### 1. สร้าง Firebase Project
- ไปที่ [Firebase Console](https://console.firebase.google.com/)
- สร้างโปรเจกต์ใหม่ชื่อ `swu-eat-rank`
- เลือก location: `asia-east1`

### 2. เปิดใช้งาน Services
- **Firestore Database**: เปิดใช้งานใน Native mode
- **Authentication**: เปิดใช้งาน Anonymous authentication

### 3. เอา Config
- ไปที่ Project Settings → General
- ในส่วน "Your apps" กด "Add app" → Web
- ตั้งชื่อ app: `swu-eat-rank-web`
- คัดลอก config ที่ได้

### 4. สร้างไฟล์ .env
สร้างไฟล์ `.env` ในโฟลเดอร์ root และใส่ config:

```env
VITE_FB_API_KEY=your_api_key_here
VITE_FB_AUTH_DOMAIN=swu-eat-rank.firebaseapp.com
VITE_FB_PROJECT_ID=swu-eat-rank
VITE_FB_STORAGE_BUCKET=swu-eat-rank.appspot.com
VITE_FB_MESSAGING_SENDER_ID=your_sender_id_here
VITE_FB_APP_ID=your_app_id_here
```

### 5. Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

## Security Rules
Firestore rules ถูกตั้งค่าให้:
- `menus`: อ่านได้ทุกคน, เขียนไม่ได้ (seed ด้วย script เท่านั้น)
- `logs`: สร้างได้เฉพาะผู้ใช้ที่ล็อกอิน, อ่านได้เฉพาะของตัวเอง
- `users`: อ่าน/เขียนได้เฉพาะของตัวเอง
- `aggregates`: อ่านได้ทุกคน, เขียนไม่ได้

## การใช้งาน
หลังจากตั้งค่าเสร็จแล้ว สามารถรันโปรเจกต์ได้:
```bash
npm run dev
```
