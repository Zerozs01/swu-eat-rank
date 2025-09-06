import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAdminAuth } from '../hooks/useAdminAuth';
import type { Menu, Location, Category, Taste, Cooking } from '../types/menu';
import { LOCATIONS, CATEGORIES, TASTES, COOKING_METHODS } from '../constants/enums';

export default function EditMenu() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin, adminLoading, userEmail, isAuthenticated } = useAdminAuth();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    vendor: '',
    location: 'ENG_CANTEEN' as Location,
    category: 'RICE' as Category,
    tastes: [] as Taste[],
    ingredients: {
      veggies: [] as string[],
      proteins: [] as string[],
      cooking: 'STIR' as Cooking
    },
    nutrition: {
      cal: 0,
      fat: 0,
      sugar: 0,
      sodium: 0
    }
  });

  const [newVeggie, setNewVeggie] = useState('');
  const [newProtein, setNewProtein] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Load menu data
  useEffect(() => {
    const loadMenu = async () => {
      if (!id) return;
      
      try {
        const docRef = doc(db, 'menus', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data() as Menu;
          setFormData({
            name: data.name || '',
            vendor: data.vendor || '',
            location: data.location || 'ENG_CANTEEN',
            category: data.category || 'RICE',
            tastes: data.tastes || [],
            ingredients: {
              veggies: data.ingredients?.veggies || [],
              proteins: data.ingredients?.proteins || [],
              cooking: data.ingredients?.cooking || 'STIR'
            },
            nutrition: {
              cal: data.nutrition?.cal || 0,
              fat: data.nutrition?.fat || 0,
              sugar: data.nutrition?.sugar || 0,
              sodium: data.nutrition?.sodium || 0
            }
          });
        } else {
          setMessage('❌ ไม่พบเมนูที่ต้องการแก้ไข');
        }
      } catch (error) {
        console.error('Error loading menu:', error);
        setMessage('❌ เกิดข้อผิดพลาดในการโหลดข้อมูลเมนู');
      } finally {
        setLoading(false);
      }
    };

    loadMenu();
  }, [id]);

  const updateMenuMutation = useMutation({
    mutationFn: async (menuData: Omit<Menu, 'id'>) => {
      if (!id) throw new Error('No menu ID');
      const docRef = doc(db, 'menus', id);
      await updateDoc(docRef, {
        ...menuData,
        updatedAt: Date.now()
      });
      return { id, ...menuData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      setMessage('✅ แก้ไขเมนูสำเร็จ');
      setTimeout(() => navigate('/admin'), 2000);
    },
    onError: (error) => {
      console.error('Error updating menu:', error);
      setMessage('❌ เกิดข้อผิดพลาดในการแก้ไขเมนู');
    }
  });

  const deleteMenuMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error('No menu ID');
      const docRef = doc(db, 'menus', id);
      await deleteDoc(docRef);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      setMessage('✅ ลบเมนูสำเร็จ');
      setTimeout(() => navigate('/admin'), 2000);
    },
    onError: (error) => {
      console.error('Error deleting menu:', error);
      setMessage('❌ เกิดข้อผิดพลาดในการลบเมนู');
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.vendor.trim()) {
      setMessage('❌ กรุณากรอกชื่อเมนูและร้านค้า');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateMenuMutation.mutateAsync(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบเมนูนี้?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteMenuMutation.mutateAsync();
    } finally {
      setIsDeleting(false);
    }
  };

  const addVeggie = () => {
    if (newVeggie.trim() && !formData.ingredients.veggies.includes(newVeggie.trim())) {
      setFormData(prev => ({
        ...prev,
        ingredients: {
          ...prev.ingredients,
          veggies: [...prev.ingredients.veggies, newVeggie.trim()]
        }
      }));
      setNewVeggie('');
    }
  };

  const removeVeggie = (veggie: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: {
        ...prev.ingredients,
        veggies: prev.ingredients.veggies.filter(v => v !== veggie)
      }
    }));
  };

  const addProtein = () => {
    if (newProtein.trim() && !formData.ingredients.proteins.includes(newProtein.trim())) {
      setFormData(prev => ({
        ...prev,
        ingredients: {
          ...prev.ingredients,
          proteins: [...prev.ingredients.proteins, newProtein.trim()]
        }
      }));
      setNewProtein('');
    }
  };

  const removeProtein = (protein: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: {
        ...prev.ingredients,
        proteins: prev.ingredients.proteins.filter(p => p !== protein)
      }
    }));
  };

  const toggleTaste = (taste: Taste) => {
    setFormData(prev => ({
      ...prev,
      tastes: prev.tastes.includes(taste)
        ? prev.tastes.filter(t => t !== taste)
        : [...prev.tastes, taste]
    }));
  };

  // Loading state
  if (adminLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
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
          <p className="text-gray-600">กรุณาเข้าสู่ระบบเพื่อเข้าถึงหน้าแก้ไขเมนู</p>
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
          <p className="text-gray-600 mb-2">คุณไม่มีสิทธิ์แก้ไขเมนู</p>
          <p className="text-sm text-gray-500">Email: {userEmail}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              ✏️ แก้ไขเมนู
            </h1>
            <button
              onClick={() => navigate('/admin')}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← กลับ
            </button>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ชื่อเมนู *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ร้านค้า *
                </label>
                <input
                  type="text"
                  value={formData.vendor}
                  onChange={(e) => setFormData(prev => ({ ...prev, vendor: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
            </div>

            {/* Location & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  สถานที่
                </label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value as Location }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  aria-label="เลือกสถานที่"
                >
                  {Object.entries(LOCATIONS).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ประเภท
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Category }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  aria-label="เลือกประเภท"
                >
                  {Object.entries(CATEGORIES).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tastes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                รสชาติ
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(TASTES).map(([key, value]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleTaste(key as Taste)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      formData.tastes.includes(key as Taste)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            {/* Ingredients */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">ส่วนผสม</h3>
              
              {/* Veggies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ผัก
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newVeggie}
                    onChange={(e) => setNewVeggie(e.target.value)}
                    placeholder="เพิ่มผัก"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={addVeggie}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    เพิ่ม
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.ingredients.veggies.map(veggie => (
                    <span
                      key={veggie}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                    >
                      {veggie}
                      <button
                        type="button"
                        onClick={() => removeVeggie(veggie)}
                        className="ml-2 text-green-600 hover:text-green-800 dark:text-green-200"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Proteins */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  โปรตีน
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newProtein}
                    onChange={(e) => setNewProtein(e.target.value)}
                    placeholder="เพิ่มโปรตีน"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={addProtein}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    เพิ่ม
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.ingredients.proteins.map(protein => (
                    <span
                      key={protein}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                    >
                      {protein}
                      <button
                        type="button"
                        onClick={() => removeProtein(protein)}
                        className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-200"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Cooking Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  วิธีการปรุง
                </label>
                <select
                  value={formData.ingredients.cooking}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    ingredients: { ...prev.ingredients, cooking: e.target.value as Cooking }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  aria-label="เลือกวิธีการปรุง"
                >
                  {Object.entries(COOKING_METHODS).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Nutrition */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">ข้อมูลโภชนาการ</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    แคลอรี่
                  </label>
                  <input
                    type="number"
                    value={formData.nutrition.cal}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      nutrition: { ...prev.nutrition, cal: parseInt(e.target.value) || 0 }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ไขมัน (g)
                  </label>
                  <input
                    type="number"
                    value={formData.nutrition.fat}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      nutrition: { ...prev.nutrition, fat: parseInt(e.target.value) || 0 }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    min="0"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    น้ำตาล (g)
                  </label>
                  <input
                    type="number"
                    value={formData.nutrition.sugar}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      nutrition: { ...prev.nutrition, sugar: parseInt(e.target.value) || 0 }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    min="0"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    โซเดียม (mg)
                  </label>
                  <input
                    type="number"
                    value={formData.nutrition.sodium}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      nutrition: { ...prev.nutrition, sodium: parseInt(e.target.value) || 0 }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
              </button>
              
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'กำลังลบ...' : 'ลบเมนู'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
