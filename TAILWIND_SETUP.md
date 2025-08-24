# Tailwind CSS Setup

## การตั้งค่า Tailwind CSS

### ไฟล์ที่สร้าง:
1. `postcss.config.js` - PostCSS configuration
2. `tailwind.config.js` - Tailwind CSS configuration
3. `src/index.css` - อัปเดตด้วย Tailwind directives

### Dependencies ที่ติดตั้ง:
```bash
npm install tailwindcss@^3.4.0
```

### PostCSS Configuration:
```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### Tailwind Config:
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### Tailwind Directives ที่ใช้:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Content Paths:
- `./index.html`
- `./src/**/*.{js,ts,jsx,tsx}`

### การใช้งาน:
Tailwind CSS พร้อมใช้งานแล้ว สามารถใช้ utility classes ได้ทันที เช่น:
- `bg-blue-500` - พื้นหลังสีน้ำเงิน
- `text-white` - ข้อความสีขาว
- `p-4` - padding 1rem
- `rounded-lg` - border radius ใหญ่
- `shadow-md` - shadow กลาง

### การพัฒนา:
```bash
npm run dev
```

แอปจะรันที่ `http://localhost:5173` พร้อม Tailwind CSS
