import React from 'react';

export default function Search() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          🔍 ค้นหาเมนู
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-4">
            <input
              type="text"
              placeholder="ค้นหาชื่อเมนูหรือร้าน..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="">ทุกโรงอาหาร</option>
              <option value="ENG_CANTEEN">โรงอาหารวิศวะ</option>
              <option value="HEALTH_CANTEEN">โรงอาหารสุขภาพ</option>
              <option value="DORM_CANTEEN">โรงอาหารหอพัก</option>
            </select>
            
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="">ทุกประเภท</option>
              <option value="RICE">ข้าว</option>
              <option value="NOODLE">เส้น</option>
              <option value="FRIED">ทอด</option>
              <option value="DESSERT">หวาน</option>
              <option value="DRINK">เครื่องดื่ม</option>
            </select>
            
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="">ทุกรสชาติ</option>
              <option value="SWEET">หวาน</option>
              <option value="OILY">มัน</option>
              <option value="SPICY">เผ็ด</option>
              <option value="SOUR">เปรี้ยว</option>
              <option value="BLAND">จืด</option>
            </select>
            
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              ค้นหา
            </button>
          </div>
        </div>
        
        <div className="text-center text-gray-500">
          <p>กำลังพัฒนา... จะมีรายการเมนูแสดงที่นี่</p>
        </div>
      </div>
    </div>
  );
}
