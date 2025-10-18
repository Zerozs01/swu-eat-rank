# Firebase Setup Guide

## ขั้นตอนการตั้งค่า Firebase

### 1. สร้าง Firebase Project
- ไปที่ [Firebase Console](https://console.firebase.google.com/)
- สร้างโปรเจกต์ใหม่ชื่อ `swu-eat-rank`
- เลือก location: `asia-east1`

### 2. เปิดใช้งาน Services

- **Firestore Database**: เปิดใช้งานใน Native mode (เลือกพื้นที่ `asia-east1`)
- **Authentication**: เปิดใช้งาน Anonymous authentication
- **Storage**: เปิดใช้งาน Cloud Storage (bucket ชื่อ `swu-eat-rank.appspot.com`)
- **Cloud Functions**: ใช้ Functions (2nd Gen) เลือก runtime Node.js `20`, region `asia-east1`

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

### 5. Deploy Firestore Rules & Storage Rules

```bash
firebase deploy --only firestore:rules
firebase deploy --only storage
```

## Security Rules

Firestore rules ถูกตั้งค่าให้:

- `menus`: อ่านได้ทุกคน, เขียนไม่ได้ (seed ด้วย script เท่านั้น)
- `logs`: สร้างได้เฉพาะผู้ใช้ที่ล็อกอิน, อ่านได้เฉพาะของตัวเอง
- `users`: อ่าน/เขียนได้เฉพาะของตัวเอง
- `aggregates`: อ่านได้ทุกคน, เขียนไม่ได้

Storage rules (สรุป):

- อ่านสาธารณะ (รูปเมนูอ่านได้ทุกคน)
- เขียน/ลบ ได้เฉพาะผู้ใช้ที่ล็อกอิน (เขียนไปยัง path `menus/{menuId}/...`)

## การใช้งาน

หลังจากตั้งค่าเสร็จแล้ว สามารถรันโปรเจกต์ได้:

```bash
npm run dev
```

## Cloud Functions (อัปโหลดรูปภาพ)

เราใช้ฟังก์ชัน `uploadMenuImage` เพื่ออัปโหลดรูปจากฝั่งเซิร์ฟเวอร์ (เลี่ยง CORS):

1) ติดตั้ง dependencies ในโฟลเดอร์ `functions/`

```bash
npm --prefix functions install
```

1) (ถ้าจำเป็น) build ฟังก์ชัน

```bash
npm --prefix functions run build
```

1) Deploy ฟังก์ชัน

```bash
firebase deploy --only functions
```

1) ตั้งค่า Hosting rewrites (มีใน `firebase.json` แล้ว):

```json
{
  "hosting": {
    "rewrites": [
      { "source": "/api/uploadMenuImage", "function": { "functionId": "uploadMenuImage", "region": "asia-east1" } }
    ]
  }
}
```

1) Dev proxy (สำหรับ localhost): เพิ่มใน `vite.config.ts`

```ts
server: {
  proxy: {
    '/api': {
      target: 'https://asia-east1-swu-eat-rank.cloudfunctions.net',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
  },
}
```
