# Bug Fixes

## ปัญหาที่พบและวิธีแก้ไข

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
