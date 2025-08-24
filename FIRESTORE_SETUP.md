# Firestore Setup Guide

## การตั้งค่า Firestore Database

### 1. เปิดใช้งาน Firestore Database
1. ไปที่ [Firebase Console](https://console.firebase.google.com/)
2. เลือกโปรเจกต์ `swu-eat-rank`
3. ไปที่ **Firestore Database** ในเมนูด้านซ้าย
4. กด **Create database**
5. เลือก **Start in test mode** (สำหรับการพัฒนา)
6. เลือก location: **asia-east1 (Taiwan)**

### 2. ตั้งค่า Security Rules
อัปเดต Firestore Rules ใน Firebase Console:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {

    function isSignedIn() {
      return request.auth != null;
    }

    match /menus/{id} {
      allow read: if true;       // public
      allow write: if false;     // seed ด้วย admin/script เท่านั้น
    }

    match /logs/{id} {
      allow create: if isSignedIn()
        && request.resource.data.userId == request.auth.uid
        && request.resource.data.visibility in ['public','private'];
      allow read: if isSignedIn()
        && resource.data.userId == request.auth.uid;
      allow update, delete: if false;
    }

    match /users/{id} {
      allow read, write: if isSignedIn() && request.auth.uid == id;
    }

    match /aggregates/{id} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

### 3. Seed ข้อมูลเมนู
หลังจากตั้งค่า Firestore แล้ว รันคำสั่ง:

```bash
npm run seed
```

### 4. การทดสอบ
1. เปิดแอปที่ `http://localhost:5173`
2. ไปที่หน้า Search
3. ควรจะเห็นรายการเมนูแสดงขึ้นมา

### 5. Troubleshooting
- **Error: NOT_FOUND**: Firestore ยังไม่ได้เปิดใช้งาน
- **Error: Permission denied**: Security Rules ยังไม่ได้ตั้งค่า
- **Error: Collection not found**: ยังไม่ได้ seed ข้อมูล

### 6. การแก้ไข Permission Error
หากเกิด `PERMISSION_DENIED` ในการ seed:

1. **อัปเดต Security Rules ชั่วคราว:**
```js
match /menus/{id} {
  allow read: if true;
  allow write: if true;  // ชั่วคราวสำหรับ seed
}
```

2. **Deploy Rules:**
```bash
firebase deploy --only firestore:rules
```

3. **Seed ข้อมูล:**
```bash
npm run seed
```

4. **อัปเดต Rules กลับเป็นแบบปลอดภัย:**
```js
match /menus/{id} {
  allow read: if true;
  allow write: if false;  // ปิดการเขียน
}
```

5. **Deploy Rules อีกครั้ง:**
```bash
firebase deploy --only firestore:rules
```

## โครงสร้างข้อมูล

### Collection: menus
```json
{
  "id": "menu_001",
  "name": "ข้าวกะเพราไก่",
  "vendor": "ร้านกะเพราแม่",
  "location": "ENG_CANTEEN",
  "category": "RICE",
  "tastes": ["SPICY", "OILY"],
  "ingredients": {
    "veggies": ["กะเพรา", "พริก"],
    "proteins": ["ไก่"],
    "cooking": "STIR"
  },
  "nutrition": {
    "cal": 450,
    "fat": 15,
    "sugar": 5,
    "sodium": 800
  },
  "updatedAt": 1756049677000
}
```
