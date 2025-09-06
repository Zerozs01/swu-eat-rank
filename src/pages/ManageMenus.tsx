import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { useMenus } from '../hooks/useMenus';
import { LOCATIONS, CATEGORIES } from '../constants/enums';

export default function ManageMenus() {
  const { isAdmin, adminLoading, userEmail, isAuthenticated } = useAdminAuth();
  const { menus, isLoading, error } = useMenus();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const deleteMenuMutation = useMutation({
    mutationFn: async (menuId: string) => {
      const docRef = doc(db, 'menus', menuId);
      await deleteDoc(docRef);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
    },
    onError: (error) => {
      console.error('Error deleting menu:', error);
      alert('เกิดข้อผิดพลาดในการลบเมนู');
    }
  });

  const handleDelete = async (menuId: string, menuName: string) => {
    if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบเมนู "${menuName}"?`)) {
      return;
    }

    setIsDeleting(menuId);
    try {
      await deleteMenuMutation.mutateAsync(menuId);
      alert('ลบเมนูสำเร็จ!');
    } finally {
      setIsDeleting(null);
    }
  };

  // Loading state
  if (adminLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ต้องเข้าสู่ระบบ</h1>
          <p className="text-gray-600">กรุณาเข้าสู่ระบบเพื่อเข้าถึงหน้าจัดการเมนู</p>
        </div>
      </div>
    );
  }

  // Not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">ไม่มีสิทธิ์เข้าถึง</h1>
          <p className="text-gray-600 mb-2">คุณไม่มีสิทธิ์จัดการเมนู</p>
          <p className="text-sm text-gray-500">Email: {userEmail}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              📋 จัดการเมนูทั้งหมด
            </h1>
            <Link
              to="/admin"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← กลับหน้า Admin
            </Link>
          </div>


          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">กำลังโหลดข้อมูลเมนู...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <p>เกิดข้อผิดพลาดในการโหลดข้อมูลเมนู: {error.message}</p>
            </div>
          )}

          {/* Menu List */}
          <div className="mb-6">
            <p className="text-lg text-gray-700 dark:text-gray-300">
              รวมทั้งหมด <span className="font-bold text-blue-600">{menus?.length || 0}</span> เมนู
            </p>
          </div>

          {menus && menus.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {menus.map((menu) => (
                    <div key={menu.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                          {menu.name}
                        </h3>
                        <div className="flex gap-2">
                          <Link
                            to={`/admin/edit/${menu.id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                          >
                            ✏️ แก้ไข
                          </Link>
                          <button
                            onClick={() => handleDelete(menu.id, menu.name)}
                            disabled={isDeleting === menu.id}
                            className="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isDeleting === menu.id ? 'กำลังลบ...' : '🗑️ ลบ'}
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <p className="flex items-center">
                          <span className="mr-2">🏪</span>
                          {menu.vendor}
                        </p>
                        <p className="flex items-center">
                          <span className="mr-2">📍</span>
                          {LOCATIONS[menu.location] || menu.location}
                        </p>
                        <p className="flex items-center">
                          <span className="mr-2">🍽️</span>
                          {CATEGORIES[menu.category] || menu.category}
                        </p>
                        {menu.tastes && menu.tastes.length > 0 && (
                          <p className="flex items-center">
                            <span className="mr-2">😋</span>
                            <span className="flex flex-wrap gap-1">
                              {menu.tastes.slice(0, 3).map((taste, index) => (
                                <span key={index} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                                  {taste}
                                </span>
                              ))}
                              {menu.tastes.length > 3 && (
                                <span className="text-gray-500">+{menu.tastes.length - 3}</span>
                              )}
                            </span>
                          </p>
                        )}
                        {menu.nutrition && (
                          <p className="flex items-center">
                            <span className="mr-2">🔥</span>
                            {menu.nutrition.cal} แคลอรี่
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <div className="text-6xl mb-4">🍽️</div>
                  <p className="text-xl mb-2">ยังไม่มีเมนูในระบบ</p>
                  <p className="text-sm mb-4">เพิ่มเมนูแรกของคุณได้เลย!</p>
                  <Link
                    to="/admin"
                    className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    เพิ่มเมนูใหม่
                  </Link>
                </div>
              )}
        </div>
      </div>
    </div>
  );
}
