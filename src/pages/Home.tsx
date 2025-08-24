import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMenus } from '../hooks/useMenus';
import { LOCATIONS, CATEGORIES } from '../constants/enums';
import type { Location, Category } from '../types/menu';

export default function Home() {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState<Location | ''>('');
  const [selectedCategory, setSelectedCategory] = useState<Category | ''>('');
  const [isRandomizing, setIsRandomizing] = useState(false);
  
  const { data: menus } = useMenus();

  const handleRandomMenu = () => {
    if (!menus || menus.length === 0) return;
    
    setIsRandomizing(true);
    
    // Filter menus based on selection
    let filteredMenus = menus;
    if (selectedLocation) {
      filteredMenus = filteredMenus.filter(menu => menu.location === selectedLocation);
    }
    if (selectedCategory) {
      filteredMenus = filteredMenus.filter(menu => menu.category === selectedCategory);
    }
    
    if (filteredMenus.length === 0) {
      alert('ไม่พบเมนูที่ตรงกับเงื่อนไขที่เลือก');
      setIsRandomizing(false);
      return;
    }
    
    // Random selection
    const randomIndex = Math.floor(Math.random() * filteredMenus.length);
    const randomMenu = filteredMenus[randomIndex];
    
    // Navigate to menu detail
    setTimeout(() => {
      navigate(`/menu/${randomMenu.id}`);
      setIsRandomizing(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🍽️ SWU EatRank
          </h1>
          
          
          {/* Random Menu Section */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              🎲 สุ่มเมนู
            </h2>
            <p className="text-gray-600 mb-4">
              ไม่รู้จะกินอะไรดี? ให้เราเลือกให้!
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value as Location | '')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">ทุกโรงอาหาร</option>
                {Object.entries(LOCATIONS).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as Category | '')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">ทุกประเภท</option>
                {Object.entries(CATEGORIES).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>
            
            <button
              onClick={handleRandomMenu}
              disabled={isRandomizing}
              className="w-full bg-purple-500 text-white py-3 px-4 rounded-lg hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isRandomizing ? '🎲 กำลังสุ่ม...' : '🎲 สุ่มเมนูให้ฉัน!'}
            </button>
          </div>

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
                🔐 ระบบล็อคอิน
              </h2>
              <p className="text-gray-600">
                สำหรับผู้ใช้ที่ต้องการบันทึกประวัติการกินและติดตามสุขภาพ
              </p>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>ผู้ใช้ 2 แบบ:</strong><br/>
                  • <strong>Anonymous:</strong> ค้นหาเมนู สุ่มเมนู ไม่ต้องล็อคอิน<br/>
                  • <strong>Registered:</strong> บันทึกประวัติ ติดตามสุขภาพ (กำลังพัฒนา)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
