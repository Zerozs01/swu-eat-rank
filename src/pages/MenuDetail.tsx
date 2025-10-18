import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { LOCATIONS, CATEGORIES, TASTES, COOKING_METHODS, FACULTIES } from '../constants/enums';
import { calcHealthScore } from '../utils/healthScore';
import HealthBadge from '../components/HealthBadge';
import { useLogs } from '../hooks/useLogs';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import type { Menu } from '../types/menu';

export default function MenuDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [selectedFaculty, setSelectedFaculty] = useState(userProfile?.faculty || '');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [quantity, setQuantity] = useState(1);

  const { createLog } = useLogs();
  const { showNotification } = useNotification();

  const { data: menu, isLoading, error } = useQuery({
    queryKey: ['menu', id],
    queryFn: async (): Promise<Menu> => {
      if (!id) throw new Error('Menu ID is required');
      const menuDoc = await getDoc(doc(db, 'menus', id));
      if (!menuDoc.exists()) {
        throw new Error('Menu not found');
      }
      return { id: menuDoc.id, ...menuDoc.data() } as Menu;
    },
    enabled: !!id,
  });

    const handleLogMeal = async () => {
    if (!menu || !selectedFaculty) return;

    try {
      await createLog.mutateAsync({
        menuId: menu.id,
        faculty: selectedFaculty,
        visibility,
        quantity
      });

      // Show success notification
      showNotification({
        type: 'success',
        title: 'บันทึกสำเร็จ! 🎉',
        message: `บันทึกการกิน "${menu.name}" แล้ว`,
        duration: 3000
      });

      // Check for achievements
      const healthScore = calcHealthScore(menu);
      if (healthScore >= 80) {
        setTimeout(() => {
          showNotification({
            type: 'achievement',
            title: '🏆 เก่งมาก!',
            message: 'คุณเลือกเมนูที่มีประโยชน์ต่อสุขภาพมาก',
            duration: 5000
          });
        }, 1000);
      }

      navigate('/me');
    } catch (error) {
      console.error('Error logging meal:', error);
      showNotification({
        type: 'warning',
        title: 'เกิดข้อผิดพลาด',
        message: 'ไม่สามารถบันทึกการกินได้ กรุณาลองใหม่อีกครั้ง',
        duration: 5000
      });
    }
  };

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            ต้องเข้าสู่ระบบก่อน
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            กรุณาเข้าสู่ระบบเพื่อดูรายละเอียดเมนู
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            กลับไปหน้าแรก
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดเมนู...</p>
        </div>
      </div>
    );
  }

  if (error || !menu) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">ไม่พบเมนูที่ต้องการ</p>
          <button
            onClick={() => navigate('/search')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            กลับไปค้นหา
          </button>
        </div>
      </div>
    );
  }

  const healthScore = calcHealthScore(menu);
  // const healthLabel = getHealthScoreLabel(healthScore);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Cover Image */}
        {menu.imageUrl && (
          <div className="mb-6 w-full max-w-5xl mx-auto">
            <div className="w-full aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden">
              <img src={menu.imageUrl} alt={menu.name} className="w-full h-full object-cover" />
            </div>
          </div>
        )}
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/search')}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            ← กลับไปค้นหา
          </button>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{menu.name}</h1>
          <p className="text-lg text-gray-600">{menu.vendor}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Menu Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">ข้อมูลเมนู</h2>
            
            <div className="space-y-4">
              {/* Health Score */}
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Health Score:</span>
                <HealthBadge score={healthScore} />
              </div>

              {/* Location, Category & Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">📍 โรงอาหาร</span>
                  <p className="font-medium">{LOCATIONS[menu.location]}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">🍽️ ประเภท</span>
                  <p className="font-medium">{CATEGORIES[menu.category]}</p>
                </div>
                {typeof menu.price === 'number' && (
                  <div className="col-span-2">
                    <span className="text-sm text-gray-500">💵 ราคา</span>
                    <p className="font-medium">฿{menu.price}</p>
                  </div>
                )}
              </div>

              {/* Tastes */}
              <div>
                <span className="text-sm text-gray-500">😋 รสชาติ</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {menu.tastes.map((taste) => (
                    <span
                      key={taste}
                      className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                    >
                      {TASTES[taste]}
                    </span>
                  ))}
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <span className="text-sm text-gray-500">🥬 ส่วนผสม</span>
                <div className="mt-1">
                  {menu.ingredients.veggies && menu.ingredients.veggies.length > 0 && (
                    <div className="mb-2">
                      <span className="text-xs text-gray-500">ผัก:</span>
                      <span className="ml-2 text-sm">{menu.ingredients.veggies.join(', ')}</span>
                    </div>
                  )}
                  {menu.ingredients.proteins && menu.ingredients.proteins.length > 0 && (
                    <div className="mb-2">
                      <span className="text-xs text-gray-500">โปรตีน:</span>
                      <span className="ml-2 text-sm">{menu.ingredients.proteins.join(', ')}</span>
                    </div>
                  )}
                  {menu.ingredients.cooking && (
                    <div>
                      <span className="text-xs text-gray-500">วิธีปรุง:</span>
                      <span className="ml-2 text-sm">{COOKING_METHODS[menu.ingredients.cooking]}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Nutrition */}
              {menu.nutrition && (
                <div>
                  <span className="text-sm text-gray-500">📊 โภชนาการ</span>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <span className="text-xs text-gray-500">🔥 แคลอรี่</span>
                      <p className="font-medium">{menu.nutrition.cal} cal</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">🧈 ไขมัน</span>
                      <p className="font-medium">{menu.nutrition.fat}g</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">🍯 น้ำตาล</span>
                      <p className="font-medium">{menu.nutrition.sugar}g</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">🧂 โซเดียม</span>
                      <p className="font-medium">{menu.nutrition.sodium}mg</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

                     {/* Log Meal */}
           <div className="bg-white rounded-lg shadow-md p-6">
             <h2 className="text-xl font-semibold text-gray-800 mb-4">บันทึกการกิน</h2>
             
             {userProfile?.email ? (
               <div className="space-y-4">
                 {/* Faculty Selection */}
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     คณะของคุณ
                   </label>
                   <select
                     value={selectedFaculty}
                     onChange={(e) => setSelectedFaculty(e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                     aria-label="เลือกคณะของคุณ"
                   >
                     <option value="">เลือกคณะ</option>
                     {FACULTIES.map((faculty) => (
                       <option key={faculty} value={faculty}>
                         {faculty}
                       </option>
                     ))}
                   </select>
                 </div>

                                {/* Quantity Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      จำนวนที่สั่ง
                    </label>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600"
                      >
                        -
                      </button>
                      <span className="text-lg font-semibold text-gray-800 w-8 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600"
                      >
                        +
                      </button>
                      <span className="text-sm text-gray-600">จาน</span>
                    </div>
                  </div>

                  {/* Visibility Toggle */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      การแสดงผล
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="public"
                          checked={visibility === 'public'}
                          onChange={(e) => setVisibility(e.target.value as 'public' | 'private')}
                          className="mr-2"
                        />
                        <span className="text-sm">สาธารณะ (รวมในสถิติ)</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="private"
                          checked={visibility === 'private'}
                          onChange={(e) => setVisibility(e.target.value as 'public' | 'private')}
                          className="mr-2"
                        />
                        <span className="text-sm">ส่วนตัว</span>
                      </label>
                    </div>
                  </div>

                 {/* Log Button */}
                 <button
                   onClick={handleLogMeal}
                   disabled={!selectedFaculty || createLog.isPending}
                   className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                 >
                   {createLog.isPending ? 'กำลังบันทึก...' : '🍽️ ฉันกินเมนูนี้!'}
                 </button>
               </div>
             ) : (
               <div className="text-center py-8">
                 <div className="mb-4">
                   <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                   </svg>
                 </div>
                 <h3 className="text-lg font-medium text-gray-900 mb-2">ต้องเข้าสู่ระบบก่อน</h3>
                 <p className="text-gray-600 mb-4">กรุณาเข้าสู่ระบบด้วยอีเมลเพื่อบันทึกการกินเมนูนี้</p>
                 <button
                   onClick={() => {
                     // Trigger login modal
                     const event = new CustomEvent('openLoginModal');
                     window.dispatchEvent(event);
                   }}
                   className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg transition-colors"
                 >
                   เข้าสู่ระบบ
                 </button>
               </div>
             )}

             {/* Health Tips */}
             <div className="mt-6 p-4 bg-blue-50 rounded-lg">
               <h3 className="font-medium text-blue-800 mb-2">💡 เคล็ดลับสุขภาพ</h3>
               <p className="text-sm text-blue-700">
                 {healthScore >= 80 && 'เมนูนี้ดีต่อสุขภาพมาก! 🎉'}
                 {healthScore >= 60 && healthScore < 80 && 'เมนูนี้ดีต่อสุขภาพ ควรกินในปริมาณที่เหมาะสม'}
                 {healthScore >= 40 && healthScore < 60 && 'เมนูนี้ควรกินในปริมาณน้อย และเสริมด้วยผักผลไม้'}
                 {healthScore < 40 && 'เมนูนี้ควรกินในปริมาณน้อย และหันไปกินเมนูที่มีประโยชน์มากกว่า'}
               </p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
