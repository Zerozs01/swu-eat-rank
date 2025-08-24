import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🍽️ SWU EatRank
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            ช่วยเลือกเมนูโรงอาหาร พร้อม Health Score และ Ranking
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Link
              to="/search"
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                🔍 ค้นหาเมนู
              </h2>
              <p className="text-gray-600">
                ค้นหาเมนูที่ชอบ ดู Health Score และข้อมูลโภชนาการ
              </p>
            </Link>
            
            <Link
              to="/board"
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                📊 กระดานรวม
              </h2>
              <p className="text-gray-600">
                ดูเมนูยอดฮิตวันนี้ และสถิติการกินของเพื่อนๆ
              </p>
            </Link>
            
            <Link
              to="/me"
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                👤 ประวัติของฉัน
              </h2>
              <p className="text-gray-600">
                ดูประวัติการกินและ Health Summary
              </p>
            </Link>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                🎯 เป้าหมาย
              </h2>
              <p className="text-gray-600">
                ลดภาระผู้ใช้ ไม่ต้องกรอกเยอะ แต่ได้ข้อมูลที่ actionable
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
