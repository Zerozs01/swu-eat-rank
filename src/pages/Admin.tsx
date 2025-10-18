import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { db, storage, auth } from '../lib/firebase';
import { ref as storageRef, uploadBytesResumable, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getIdToken } from 'firebase/auth';
import { useAdminAuth } from '../hooks/useAdminAuth';
import type { Menu, Location, Category, Taste, Cooking } from '../types/menu';
import { LOCATIONS, CATEGORIES, TASTES, COOKING_METHODS } from '../constants/enums';

export default function Admin() {
  const { isAdmin, isOwner, adminLoading, userEmail, isAuthenticated } = useAdminAuth();
  const [formData, setFormData] = useState({
    name: '',
    vendor: '',
    location: 'ENG_CANTEEN' as Location,
    category: 'RICE' as Category,
    tastes: [] as Taste[],
    price: undefined as number | undefined,
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
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const queryClient = useQueryClient();

  const addMenuMutation = useMutation({
    mutationFn: async (menuData: Omit<Menu, 'id' | 'updatedAt'>) => {
      const docRef = await addDoc(collection(db, 'menus'), {
        ...menuData,
        updatedAt: Date.now()
      });
      return docRef.id;
    },
    onError: (error) => {
      setMessage(`❌ เกิดข้อผิดพลาด: ${error.message}`);
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return setSelectedFile(null);
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSizeMb = 3; // <= 3MB
    if (!validTypes.includes(file.type)) {
      setMessage('❌ รองรับเฉพาะไฟล์ JPG/PNG/WEBP เท่านั้น');
      return;
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      setMessage(`❌ ไฟล์ใหญ่เกินไป (เกิน ${maxSizeMb}MB)`);
      return;
    }
    setMessage('');
    setSelectedFile(file);
  };

  const uploadViaFunction = async (menuId: string, file: File) => {
    const token = await getIdToken(auth.currentUser!, true);
    const form = new FormData();
    form.append('file', file);
    const resp = await fetch(`/api/uploadMenuImage?menuId=${encodeURIComponent(menuId)}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      throw new Error(`Server upload failed: ${resp.status} ${text}`);
    }
    return resp.json() as Promise<{ url: string; path: string }>; 
  };

  const handleInputChange = (
    field: 'name' | 'vendor' | 'location' | 'category' | 'price',
    value: string | number | Location | Category | undefined
  ) => {
    setFormData(prev => {
      if (field === 'name') return { ...prev, name: value as string };
      if (field === 'vendor') return { ...prev, vendor: value as string };
      if (field === 'location') return { ...prev, location: value as Location };
      if (field === 'category') return { ...prev, category: value as Category };
      if (field === 'price') return { ...prev, price: value as number | undefined };
      return prev;
    });
  };

  const updateCooking = (value: Cooking) => {
    setFormData(prev => ({
      ...prev,
      ingredients: {
        ...prev.ingredients,
        cooking: value
      }
    }));
  };

  const updateNutrition = (field: 'cal' | 'fat' | 'sugar' | 'sodium', value: number) => {
    setFormData(prev => ({
      ...prev,
      nutrition: {
        ...prev.nutrition,
        [field]: value
      }
    }));
  };

  const handleTasteChange = (taste: Taste, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      tastes: checked 
        ? [...prev.tastes, taste]
        : prev.tastes.filter(t => t !== taste)
    }));
  };

  const addVeggie = () => {
    if (newVeggie.trim()) {
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

  const removeVeggie = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: {
        ...prev.ingredients,
        veggies: prev.ingredients.veggies.filter((_, i) => i !== index)
      }
    }));
  };

  const addProtein = () => {
    if (newProtein.trim()) {
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

  const removeProtein = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: {
        ...prev.ingredients,
        proteins: prev.ingredients.proteins.filter((_, i) => i !== index)
      }
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      vendor: '',
      location: 'ENG_CANTEEN',
      category: 'RICE',
      tastes: [],
      price: undefined,
      ingredients: {
        veggies: [],
        proteins: [],
        cooking: 'STIR'
      },
      nutrition: {
        cal: 0,
        fat: 0,
        sugar: 0,
        sodium: 0
      }
    });
    setNewVeggie('');
    setNewProtein('');
    setSelectedFile(null);
    setUploadProgress(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      // Only pass price when valid number
      const payload = {
        name: formData.name,
        vendor: formData.vendor,
        location: formData.location,
        category: formData.category,
        tastes: formData.tastes,
        ingredients: formData.ingredients,
        nutrition: formData.nutrition,
        ...(typeof formData.price === 'number' && !Number.isNaN(formData.price) ? { price: formData.price } : {}),
      } as Omit<Menu, 'id' | 'updatedAt'>;

      const newId = await addMenuMutation.mutateAsync(payload);

      let uploadErrorMessage: string | null = null;
      // If image selected, upload and update menu doc with image fields
      if (selectedFile) {
        try {
          setUploadProgress(0);
          const path = `menus/${newId}/${Date.now()}-${selectedFile.name}`;
          const ref = storageRef(storage, path);
          const isLocal = typeof window !== 'undefined' && window.location.origin.includes('localhost');
          if (isLocal) {
            const data = await uploadViaFunction(newId, selectedFile);
            await setDoc(doc(db, 'menus', newId), { imageUrl: data.url, imagePath: data.path, updatedAt: Date.now() }, { merge: true });
          } else {
            try {
              const task = uploadBytesResumable(ref, selectedFile, { contentType: selectedFile.type });
              await new Promise<void>((resolve, reject) => {
                task.on('state_changed', (snap) => {
                  const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
                  setUploadProgress(pct);
                }, reject, () => resolve());
              });
              const url = await getDownloadURL(ref);
              await setDoc(doc(db, 'menus', newId), { imageUrl: url, imagePath: path, updatedAt: Date.now() }, { merge: true });
            } catch {
              try {
                await uploadBytes(ref, selectedFile, { contentType: selectedFile.type });
                const url = await getDownloadURL(ref);
                await setDoc(doc(db, 'menus', newId), { imageUrl: url, imagePath: path, updatedAt: Date.now() }, { merge: true });
              } catch {
                const data = await uploadViaFunction(newId, selectedFile);
                await setDoc(doc(db, 'menus', newId), { imageUrl: data.url, imagePath: data.path, updatedAt: Date.now() }, { merge: true });
              }
            }
          }
        } catch (uploadErr) {
          console.error('Error uploading image after create:', uploadErr);
          uploadErrorMessage = '⚠️ เพิ่มเมนูแล้ว แต่การอัปโหลดรูปมีปัญหา';
        } finally {
          setUploadProgress(0);
        }
      }

      queryClient.invalidateQueries({ queryKey: ['menus'] });
      setMessage(uploadErrorMessage ?? '✅ เพิ่มเมนูสำเร็จ!');
      resetForm();
    } catch (error) {
      console.error('Error adding menu:', error);
      setMessage('❌ เกิดข้อผิดพลาดในการเพิ่มเมนู');
    } finally {
      setIsSubmitting(false);
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
          <p className="text-gray-600">กรุณาเข้าสู่ระบบเพื่อเข้าถึงหน้า Admin</p>
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
          <p className="text-gray-600 mb-2">คุณไม่มีสิทธิ์เข้าถึงหน้า Admin</p>
          <p className="text-sm text-gray-500">Email: {userEmail}</p>
          <p className="text-sm text-gray-500 mt-2">
            หากต้องการสิทธิ์ กรุณาติดต่อผู้ดูแลระบบ
          </p>
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
              🍽️ Admin - เพิ่มเมนูใหม่
            </h1>
            <div className="flex gap-3">
              <Link
                to="/admin/menus"
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                📋 จัดการเมนู
              </Link>
              {isOwner && (
                <Link
                  to="/admin/users"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  👥 จัดการ Admin Users
                </Link>
              )}
            </div>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes('✅') 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* รูปภาพเมนู */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                รูปภาพเมนู
              </label>
              <input
                id="newMenuImage"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                title="เลือกรูปภาพเมนู"
              />
              {selectedFile && (
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <span>{selectedFile.name}</span>
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <progress value={uploadProgress} max={100} className="w-40 h-2"></progress>
                  )}
                </div>
              )}
              <p className="text-xs text-gray-500">แนะนำ: JPG/PNG/WEBP ≤ 3MB</p>
            </div>
            {/* ชื่อเมนู */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ชื่อเมนู *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="เช่น ข้าวกะเพราไก่"
              />
            </div>

            {/* ชื่อร้าน */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ชื่อร้าน *
              </label>
              <input
                type="text"
                required
                value={formData.vendor}
                onChange={(e) => handleInputChange('vendor', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="เช่น ร้านกะเพราแม่"
              />
            </div>

            {/* โรงอาหาร */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                โรงอาหาร *
              </label>
              <select
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value as Location)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                aria-label="เลือกโรงอาหาร"
              >
                {Object.entries(LOCATIONS).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>

            {/* ประเภทอาหาร */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ประเภทอาหาร *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value as Category)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                aria-label="เลือกประเภทอาหาร"
              >
                {Object.entries(CATEGORIES).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>

            {/* ราคาอาหาร */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ราคา (บาท)
              </label>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={1}
                value={typeof formData.price === 'number' ? formData.price : ''}
                onChange={(e) => {
                  const v = e.target.value;
                  const num = v === '' ? undefined : Number(v);
                  handleInputChange('price', Number.isFinite(num as number) ? (num as number) : undefined);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="เช่น 50"
                aria-label="กรอกราคาอาหาร"
              />
            </div>

            {/* รสชาติ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                รสชาติ
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(TASTES).map(([key, value]) => (
                  <label key={key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.tastes.includes(key as Taste)}
                      onChange={(e) => handleTasteChange(key as Taste, e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* ส่วนผสม - ผัก */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ผัก
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newVeggie}
                  onChange={(e) => setNewVeggie(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addVeggie())}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="เช่น กะเพรา, พริก"
                />
                <button
                  type="button"
                  onClick={addVeggie}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  เพิ่ม
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.ingredients.veggies.map((veggie, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  >
                    {veggie}
                    <button
                      type="button"
                      onClick={() => removeVeggie(index)}
                      className="ml-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* ส่วนผสม - โปรตีน */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                โปรตีน
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newProtein}
                  onChange={(e) => setNewProtein(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addProtein())}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="เช่น ไก่, หมู, ปลา"
                />
                <button
                  type="button"
                  onClick={addProtein}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  เพิ่ม
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.ingredients.proteins.map((protein, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    {protein}
                    <button
                      type="button"
                      onClick={() => removeProtein(index)}
                      className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* วิธีการปรุง */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                วิธีการปรุง
              </label>
              <select
                value={formData.ingredients.cooking}
                onChange={(e) => updateCooking(e.target.value as Cooking)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                aria-label="เลือกวิธีการปรุง"
              >
                {Object.entries(COOKING_METHODS).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>

            {/* ข้อมูลโภชนาการ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ข้อมูลโภชนาการ (ต่อ 1 จาน)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">แคลอรี่</label>
                  <input
                    type="number"
                    value={formData.nutrition.cal}
                    onChange={(e) => updateNutrition('cal', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="450"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">ไขมัน (g)</label>
                  <input
                    type="number"
                    value={formData.nutrition.fat}
                    onChange={(e) => updateNutrition('fat', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="15"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">น้ำตาล (g)</label>
                  <input
                    type="number"
                    value={formData.nutrition.sugar}
                    onChange={(e) => updateNutrition('sugar', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="5"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">โซเดียม (mg)</label>
                  <input
                    type="number"
                    value={formData.nutrition.sodium}
                    onChange={(e) => updateNutrition('sodium', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="800"
                  />
                </div>
              </div>
            </div>

            {/* ปุ่มส่ง */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'กำลังเพิ่ม...' : 'เพิ่มเมนู'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                รีเซ็ต
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
