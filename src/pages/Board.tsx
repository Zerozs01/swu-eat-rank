import React from 'react';

export default function Board() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          📊 กระดานรวม
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            เมนูยอดฮิตวันนี้
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <select 
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              aria-label="เลือกคณะ"
            >
              <option value="">ทุกคณะ</option>
              <option value="วิศวะ">วิศวะ</option>
              <option value="สุขภาพ">สุขภาพ</option>
              <option value="วิทยาศาสตร์">วิทยาศาสตร์</option>
              <option value="มนุษยศาสตร์">มนุษยศาสตร์</option>
              <option value="สังคมศาสตร์">สังคมศาสตร์</option>
              <option value="เกษตรศาสตร์">เกษตรศาสตร์</option>
            </select>
            
            <select 
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              aria-label="เลือกโรงอาหาร"
            >
              <option value="">ทุกโรงอาหาร</option>
              <option value="ENG_CANTEEN">โรงอาหารวิศวะ</option>
              <option value="HEALTH_CANTEEN">โรงอาหารสุขภาพ</option>
              <option value="DORM_CANTEEN">โรงอาหารหอพัก</option>
            </select>
            
            <select 
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              aria-label="เลือกประเภทอาหาร"
            >
              <option value="">ทุกประเภท</option>
              <option value="RICE">ข้าว</option>
              <option value="NOODLE">เส้น</option>
              <option value="FRIED">ทอด</option>
              <option value="DESSERT">หวาน</option>
              <option value="DRINK">เครื่องดื่ม</option>
            </select>
          </div>
          
          <div className="text-center text-gray-500">
            <p>กำลังพัฒนา... จะมีสถิติเมนูยอดฮิตแสดงที่นี่</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            เมนูเฮลธ์สุดวันนี้
          </h2>
          <div className="text-center text-gray-500">
            <p>กำลังพัฒนา... จะมีเมนูสุขภาพดีแสดงที่นี่</p>
          </div>
        </div>
      </div>
    </div>
  );
}
