# Bug Fixes

## ปัญหาที่พบและวิธีแก้ไข

### 0. อัปโหลดรูปไป Firebase Storage ติด CORS (localhost และบนโฮสต์)

**อาการ:**

```text
Access to XMLHttpRequest at 'https://firebasestorage.googleapis.com/...'
from origin 'http://localhost:5173' has been blocked by CORS policy:
Response to preflight request doesn't pass access control check
```

และ/หรือบนโฮสต์ web.app ก็ยังล้มเหลวแบบเดียวกัน

**สาเหตุ:** สภาพแวดล้อมเบราว์เซอร์บล็อก preflight ของคำขออัปโหลด (แม้กฎ Storage ถูกต้อง) ทำให้การอัปโหลดจาก client โดยตรงล้มเหลว

**วิธีแก้ไข (ถาวร/เสถียร):**

- เพิ่ม Cloud Function `uploadMenuImage` (Functions v2, Node.js 20) เพื่ออัปโหลดไฟล์ฝั่งเซิร์ฟเวอร์ แทนการส่งไป Storage ตรงจากเบราว์เซอร์
- ใช้ metadata token (`firebaseStorageDownloadTokens`) เพื่อสร้าง URL ดาวน์โหลด แทน `getSignedUrl` (ไม่ต้องใช้สิทธิ์ `iam.serviceAccounts.signBlob`)
- เพิ่ม Hosting rewrite: `/api/uploadMenuImage` → ฟังก์ชัน และใน dev เพิ่ม Vite proxy `/api/*` → Cloud Functions host เพื่อให้ localhost ใช้งานได้
- ฝั่ง client ทำลำดับการอัปโหลด: (โฮสต์) Storage → ถ้าล้มเหลว fallback ไปฟังก์ชัน, (localhost) ใช้ฟังก์ชันโดยตรง

ไฟล์เกี่ยวข้อง:

- `functions/src/index.ts` — ฟังก์ชันอัปโหลด + verify Firebase ID token
- `src/pages/EditMenu.tsx` — ลำดับการอัปโหลด + fallback + server-first บน localhost
- `firebase.json` — เพิ่ม functions (nodejs20) และ hosting rewrites
- `vite.config.ts` — เพิ่ม dev proxy `/api`

การยืนยันผล: อัปโหลดรูปสำเร็จทั้งบน localhost และบนเว็บโฮสต์; Firestore อัปเดต `imageUrl`, `imagePath` และแสดงรูปใน UI ได้

### 1. Tailwind CSS PostCSS Plugin Error

**ปัญหา:**
```
[postcss] It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin
```

**สาเหตุ:** Tailwind CSS v4 ต้องการ PostCSS plugin แยกต่างหาก

**วิธีแก้ไข:**

```bash
npm install @tailwindcss/postcss
```

**อัปเดต `postcss.config.js`:**

```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
```

### 2. Firebase Auth Import Error

**ปัญหา:**
```
Uncaught SyntaxError: The requested module does not provide an export named 'User'
```

**สาเหตุ:** Firebase Auth v12+ เปลี่ยนการ export types

**วิธีแก้ไข:**
**ก่อน:**

```ts
import { User as FirebaseUser, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
```

**หลัง:**

```ts
import { signInAnonymously, onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
```

### 3. TypeScript Import Error

**ปัญหา:**
```
Uncaught SyntaxError: The requested module does not provide an export named 'Category'
```

**สาเหตุ:** TypeScript types ต้องใช้ `import type` สำหรับ type imports

**วิธีแก้ไข:**
**ก่อน:**

```ts
import { Menu, Location, Category, Taste } from '../types/menu';
```

**หลัง:**

```ts
import type { Menu, Location, Category, Taste } from '../types/menu';
```

**ไฟล์ที่ต้องแก้ไข:**
- `src/hooks/useMenus.ts`
- `src/pages/Search.tsx`
- `src/components/MenuCard.tsx`
- `src/utils/healthScore.ts`
- `src/constants/enums.ts` ← ไฟล์นี้ลืมแก้!

### 3. การแก้ไขอื่นๆ

- ลบ `src/App.css` ที่ไม่ต้องการ
- อัปเดต `src/index.css` ด้วย Tailwind directives
- สร้างไฟล์ config ที่จำเป็น

## การทดสอบ

หลังจากแก้ไขแล้ว แอปควรจะ:

- รันได้ที่ `http://localhost:5173`
- ไม่มี console errors
- แสดงหน้า Home ได้ปกติ
- Tailwind CSS ทำงานได้
