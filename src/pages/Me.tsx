import React from 'react';

export default function Me() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          👤 ประวัติของฉัน
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              📊 สรุปสุขภาพ
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>เมนูสุขภาพดี (≥70)</span>
                <span className="font-semibold text-green-600">0</span>
              </div>
              <div className="flex justify-between">
                <span>เมนูทั้งหมด</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between">
                <span>Health Score เฉลี่ย</span>
                <span className="font-semibold text-blue-600">0</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              🏆 Badges
            </h2>
            <div className="text-center text-gray-500">
              <p>กำลังพัฒนา... จะมี badges แสดงที่นี่</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            📅 ประวัติการกิน (7 วันล่าสุด)
          </h2>
          <div className="text-center text-gray-500">
            <p>กำลังพัฒนา... จะมีประวัติการกินแสดงที่นี่</p>
          </div>
        </div>
      </div>
    </div>
  );
}
