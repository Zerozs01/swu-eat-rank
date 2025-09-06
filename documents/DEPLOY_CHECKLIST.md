# SWU EatRank — Deploy Checklist

## 🚀 Pre-Deploy Checklist

### Environment & Configuration
- [ ] สร้างไฟล์ `.env` จาก `env.example`
- [ ] ตั้งค่า Firebase environment variables ทั้งหมด
- [ ] ตรวจสอบ `storageBucket` เป็น `*.appspot.com` (ไม่ใช่ `firebasestorage.app`)
- [ ] ลบคีย์ Firebase ออกจาก source code (ถ้ามี)

### Database & Rules
- [ ] Deploy Firestore rules: `firebase deploy --only firestore:rules`
- [ ] Deploy Firestore indexes: `firebase deploy --only firestore:indexes`
- [ ] Seed ข้อมูลเมนู: `npm run seed`
- [ ] ตรวจสอบข้อมูลเมนู ≥ 50 รายการ

### Code Quality
- [ ] รัน `npm run build` สำเร็จ
- [ ] รัน `npm run lint` ไม่มี errors
- [ ] ตรวจสอบ TypeScript compilation
- [ ] ทดสอบฟีเจอร์หลัก:
  - [ ] ค้นหาเมนู
  - [ ] บันทึก log (public/private)
  - [ ] ดู Board (ยอดฮิตวันนี้)
  - [ ] ดู Profile (ประวัติส่วนตัว)

### Performance & UX
- [ ] ตรวจสอบ loading states
- [ ] ตรวจสอบ error handling
- [ ] ทดสอบ responsive design (mobile)
- [ ] ตรวจสอบ dark mode
- [ ] ตรวจสอบ accessibility

### Security
- [ ] ตรวจสอบ Firestore rules
- [ ] ตรวจสอบ anonymous auth
- [ ] ตรวจสอบ data privacy (ไม่มีข้อมูลส่วนตัวรั่ว)

## 🎯 Deploy Commands

### 1. Deploy Firestore Rules & Indexes
```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

### 2. Build & Deploy App
```bash
npm run build
firebase deploy --only hosting
```

### 3. Verify Deployment
- [ ] เปิด URL ที่ deploy แล้ว
- [ ] ทดสอบฟีเจอร์หลัก
- [ ] ตรวจสอบ console errors
- [ ] ตรวจสอบ network requests

## 🔍 Post-Deploy Verification

### Functional Tests
- [ ] Anonymous authentication ทำงาน
- [ ] ค้นหาเมนูได้
- [ ] บันทึก log ได้ (public/private)
- [ ] Board แสดงยอดฮิตวันนี้
- [ ] Profile แสดงประวัติส่วนตัว
- [ ] CRUD operations สำหรับ logs

### Performance Tests
- [ ] หน้าแรกโหลดเร็ว (< 3 วินาที)
- [ ] Search response time (< 1 วินาที)
- [ ] Board queries เร็ว (ใช้ indexes)
- [ ] Mobile performance ดี

### Security Tests
- [ ] ไม่สามารถเข้าถึงข้อมูลส่วนตัวของผู้อื่น
- [ ] Rules ป้องกัน unauthorized access
- [ ] ไม่มี sensitive data ใน client-side

## 🚨 Rollback Plan

หากเกิดปัญหา:
1. ใช้ `firebase hosting:channel:deploy previous` เพื่อ rollback
2. ตรวจสอบ Firestore rules และ indexes
3. ตรวจสอบ environment variables
4. ตรวจสอบ build logs

## 📊 Monitoring

### Key Metrics to Watch
- [ ] Page load time
- [ ] Firestore read/write operations
- [ ] Error rates
- [ ] User engagement (logs created)

### Alerts to Set Up
- [ ] High error rate (> 5%)
- [ ] Slow response time (> 5 seconds)
- [ ] Firestore quota exceeded
- [ ] Build failures

---

**หมายเหตุ:** ตรวจสอบทุกข้อใน checklist ก่อน deploy เพื่อให้แน่ใจว่าแอปทำงานได้อย่างเสถียรและปลอดภัย
