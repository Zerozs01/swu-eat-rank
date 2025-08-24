# SWU EatRank — Project Charter

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

## 🔑 เทคโนโลยี

- Vite + React + Tailwind
- Firebase (Auth Anon, Firestore, Hosting)
- React Query

## 📊 Work Breakdown

- Data team → เก็บเมนู + tag จากโรงอาหาร 3 แห่ง
- Dev FE → Routes + UI + Components
- Dev BE/DB → Firestore schema + log actions
- QA → ทดสอบ flow หลัก

## 📆 Milestone

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
