'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface BrandSettings {
  brand_name: string;
  logo_url: string | null;
}

interface Student {
  id: string;
  name: string;
}

export default function BrandHeader() {
  const [brandSettings, setBrandSettings] = useState<BrandSettings>({
    brand_name: '名貫補習班',
    logo_url: '/Black and White Circle Business Logo.png',
  });
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let brandLoaded = false;
    let studentChecked = false;

    const setLoadingComplete = () => {
      if (brandLoaded && studentChecked && mounted) {
        setLoading(false);
      }
    };

    // 載入品牌設定（使用 client-side fetch，因為這是 client component）
    fetch('/api/brand')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (!mounted) return;
        if (data && data.data) {
          setBrandSettings({
            brand_name: data.data.brand_name || '名貫補習班',
            logo_url: data.data.logo_url || '/Black and White Circle Business Logo.png',
          });
        } else {
          // 如果沒有資料，使用預設值
          setBrandSettings({
            brand_name: '名貫補習班',
            logo_url: '/Black and White Circle Business Logo.png',
          });
        }
        brandLoaded = true;
        setLoadingComplete();
      })
      .catch(err => {
        console.error('載入品牌設定失敗，使用預設值:', err);
        // 錯誤時使用預設值，避免頁面無法顯示
        if (!mounted) return;
        setBrandSettings({
          brand_name: '名貫補習班',
          logo_url: '/Black and White Circle Business Logo.png',
        });
        brandLoaded = true;
        setLoadingComplete();
      });

    // 檢查學生登入狀態
    checkStudentSession().then(() => {
      if (!mounted) return;
      studentChecked = true;
      setLoadingComplete();
    }).catch(() => {
      if (!mounted) return;
      studentChecked = true;
      setLoadingComplete();
    });

    return () => {
      mounted = false;
    };
  }, []);

  const checkStudentSession = async () => {
    try {
      const res = await fetch('/api/student/me');
      if (res.ok) {
        const data = await res.json();
        setStudent(data.student);
      }
    } catch (err) {
      // 未登入，不處理錯誤
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/student/logout', { method: 'POST' });
      setStudent(null);
      window.location.reload();
    } catch (err) {
      console.error('登出失敗:', err);
    }
  };

  return (
    <div className="w-full py-6 bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-center space-x-4">
            {/* Logo 區域 */}
            <img 
              src={brandSettings.logo_url || '/Black and White Circle Business Logo.png'} 
              alt={`${brandSettings.brand_name} Logo`} 
              className="w-[115px] h-[115px] object-contain"
              onError={(e) => {
                // 如果圖片載入失敗，使用預設
                (e.target as HTMLImageElement).src = '/Black and White Circle Business Logo.png';
              }}
            />
            {/* 補習班名稱 */}
            <h1 className="text-[43px] font-bold text-gray-800">
              {brandSettings.brand_name}
            </h1>
          </div>
          
          {/* 學生登入狀態 */}
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="text-sm text-gray-500">載入中...</div>
            ) : student ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700">歡迎，{student.name}</span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  登出
                </button>
              </div>
            ) : (
              <Link
                href="/admin/login"
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                管理員登入
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

