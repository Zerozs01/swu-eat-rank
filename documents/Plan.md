# SWU EatRank — Unified Plan (Charter + Hardening)

อัปเดตวันที่: 2025-10-26

## 🎯 เป้าหมาย

- เว็บช่วยเลือกเมนูโรงอาหาร พร้อม Health Score + Ranking
- ลดภาระผู้ใช้ ไม่ต้องกรอกเยอะ แต่ได้ข้อมูลที่ actionable

## 👥 กลุ่มเป้าหมาย

- นิสิต SWU ทุกคณะ โดยเฉพาะผู้ที่กินโรงอาหารประจำ

## 📍 ขอบเขต Phase 1 (MVP)

1. Search & Nutrition Info
2. Daily Meal Logging (public/private)
3. Community Board: เมนูยอดฮิตวันนี้ + filter
4. Profile (/me): ประวัติ + health summary
5. Firestore rules v1 (ความปลอดภัยเบื้องต้น)

สถานะ: เสร็จสิ้น ✅ (ดูรายละเอียดใน documents/PROGRESS_UPDATE.md)

## 🔑 เทคโนโลยี

- Vite + React + Tailwind
- Firebase (Auth, Firestore, Storage, Hosting, Functions v2)
- React Query

## 📊 Work Breakdown

- Data: เก็บเมนู + tag จากโรงอาหาร 3 แห่ง
- FE: Routes + UI + Components
- BE/DB: Firestore schema + logs + Functions (upload/delete image)
- QA: ทดสอบ flow หลัก + a11y

## 📆 Milestone (MVP)

- สัปดาห์ 1: โครงสร้างโปรเจกต์ + seed menus
- สัปดาห์ 2: Search + Menu Detail + Log
- สัปดาห์ 3: Board + Profile
- สัปดาห์ 4: Polish + Deploy

## 📌 Definition of Done (MVP)

- เมนูค้นหาได้ + มี Health Score
- Log มื้อสำเร็จ (public/private)
- Board แสดงยอดฮิตวันนี้ แยกตามคณะ
- Me แสดงประวัติ 7/14 วัน
- Rules ปลอดภัย: ไม่มีข้อมูลส่วนตัวรั่ว

---

## Plan2 รวมเข้า (Post-MVP hardening & Phase-2 prep)

สรุป TL;DR (อัปเดตสถานะจริง):

- Seed scripts มีพร้อมใน `scripts/` แล้ว (DONE)
- Firestore Rules ปรับให้เจ้าของแก้/ลบ log ของตัวเองได้ (DONE)
- Firebase config ใช้ env (`.env`) และ storageBucket เป็น `*.appspot.com` (DONE ตามไฟล์ env.example)
- Composite indexes สำหรับ Board ถูกเพิ่มใน `firestore.indexes.json` (DONE)
- ฟังก์ชันอัปโหลด/ลบรูปผ่าน Functions v2 (DONE) + Hosting rewrites (DONE)

### NOW — เสถียรและ deploy จริง

1) ตรวจเอกสาร/เช็กลิสต์ deploy ให้ครบถ้วน (documents/DEPLOY_CHECKLIST.md)
2) ปรับ UX หน้า Home แบบ collapsible (Energy/Clean/Budget) (DONE)
3) ปรับ Navbar มือถือ: ซ่อน “ฉัน” ถ้ายังไม่ล็อกอิน + ปุ่ม Login (DONE)

### NEXT — ความเสถียรและประสบการณ์ใช้งาน

- Error/Empty states ครบทุกหน้า (+ ErrorBoundary)
- React Query persist/cache สำหรับเมนูและ board
- Analytics events สำคัญ (search, log, board filter, upload)

### LATER — Phase 2

- Aggregates รายวัน (CF scheduled) → ใช้ที่ `/board`
- Health Score แม่นขึ้น (base โภชนาการมาตรฐาน)
- Recommendation/Swap ตามงบ/สุขภาพ/รสนิยม
- Export dashboard (เฉพาะสถิติ aggregate)

---

## Security & Privacy

- Principle of least privilege
- `menus` เขียนได้เฉพาะ admin (rules + adminUsers whitelist)
- `logs` เจ้าของอ่าน/แก้/ลบของตัวเองเท่านั้น, public ใช้นับรวมโดยไม่ระบุตัวตน
- รูปเมนูอ่านสาธารณะ, เขียนต้อง signed-in และผ่าน CF/Storage scoped paths

## QA Checklist ก่อนปล่อย

- [ ] Seed ผ่าน และเมนู ≥ 100 รายการ
- [ ] CRUD log ของตัวเองได้ตามกฎ
- [ ] Board วันนี้ + filters เร็ว (index hit)
- [ ] Lighthouse (mobile) ≥ 90 / a11y ≥ 95
- [ ] Error/Empty states ครบ
- [ ] PWA เบื้องต้น (optional)
- [ ] Analytics events ยิงครบ

## ไทม์ไลน์แนะนำ (หลังรวมแผน)

สัปดาห์นี้: ตรวจ rules/indexes/hosting, ทดสอบอัปโหลดรูป, deploy preview
สัปดาห์หน้า: persist/cache, analytics, เตรียม CF aggregate, QA รอบสุดท้าย

---

หมายเหตุ: รายละเอียด patch list เดิมใน Plan2 ที่ขัดกับสถานะล่าสุด ได้อัปเดต/ทำเสร็จแล้ว (seed/scripts, rules logs, indexes, storage bucket, ฟังก์ชันอัปโหลดภาพ)
