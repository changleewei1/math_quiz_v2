'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AVAILABLE_FONTS } from '@/lib/fonts';

interface BrandSettings {
  id: string;
  brand_name: string;
  logo_url: string | null;
  font_family: string;
  updated_at: string;
}

export default function BrandSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<BrandSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 表單狀態 - 初始化為預設值
  const [brandName, setBrandName] = useState('名貫補習班');
  const [logoUrl, setLogoUrl] = useState<string | null>('/Black and White Circle Business Logo.png');
  const [selectedFontId, setSelectedFontId] = useState(AVAILABLE_FONTS[0]?.id || 'noto-serif-tc');

  useEffect(() => {
    // 只在組件掛載時執行一次
    let mounted = true;
    
    loadSettings();
    
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSettings = async () => {
    // 防止重複請求
    if (loading) return;
    
    try {
      const res = await fetch('/api/admin/brand', {
        credentials: 'include', // 確保 cookie 被發送
        cache: 'no-store', // 禁用快取
      });
      
      // 檢查是否是未授權錯誤，如果是則重定向到登入頁
      if (res.status === 401) {
        setTimeout(() => {
          router.push('/admin/login?next=/admin/brand');
        }, 100);
        return;
      }

      // 如果是 404，表示路由不存在
      if (res.status === 404) {
        console.error('品牌設定 API 路由不存在 (404)');
        setMessage({ type: 'error', text: 'API 路由不存在，請檢查伺服器設定' });
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (res.ok && data.data) {
        // 使用回傳的資料或預設值
        const settingsData = data.data;

        setSettings(settingsData);
        setBrandName(settingsData.brand_name || '名貫補習班');
        setLogoUrl(settingsData.logo_url || '/Black and White Circle Business Logo.png');
        
        // 根據 font_family 找到對應的字型 ID
        const matchedFont = AVAILABLE_FONTS.find(
          font => font.cssFamily === settingsData.font_family
        );
        setSelectedFontId(matchedFont?.id || AVAILABLE_FONTS[0]?.id || 'noto-serif-tc');
      } else {
        // 即使 API 錯誤，也使用預設值讓頁面可以運作
        const defaultSettings = {
          id: 'default',
          brand_name: '名貫補習班',
          logo_url: '/Black and White Circle Business Logo.png',
          font_family: 'var(--font-noto-serif-tc), serif',
          updated_at: new Date().toISOString(),
        };
        setSettings(defaultSettings);
        setBrandName(defaultSettings.brand_name);
        setLogoUrl(defaultSettings.logo_url);
        setSelectedFontId(AVAILABLE_FONTS[0]?.id || 'noto-serif-tc');
        if (data.error) {
          setMessage({ type: 'error', text: data.error + '（使用預設值）' });
        }
      }
    } catch (err: any) {
      console.error('載入品牌設定失敗:', err);
      // 使用預設值，讓頁面可以顯示
      const defaultSettings = {
        id: 'default',
        brand_name: '名貫補習班',
        logo_url: '/Black and White Circle Business Logo.png',
        font_family: 'var(--font-noto-serif-tc), serif',
        updated_at: new Date().toISOString(),
      };
      setSettings(defaultSettings);
      setBrandName(defaultSettings.brand_name);
      setLogoUrl(defaultSettings.logo_url);
      setSelectedFontId(AVAILABLE_FONTS[0]?.id || 'noto-serif-tc');
      setMessage({ type: 'error', text: '載入設定失敗，使用預設值。錯誤: ' + (err.message || '未知錯誤') });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!brandName.trim()) {
      setMessage({ type: 'error', text: '請輸入補習班名稱' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const selectedFont = AVAILABLE_FONTS.find(f => f.id === selectedFontId);
      const fontFamily = selectedFont?.cssFamily || (AVAILABLE_FONTS[0]?.cssFamily || 'var(--font-noto-serif-tc), serif');

      const res = await fetch('/api/admin/brand', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_name: brandName.trim(),
          logo_url: logoUrl,
          font_family: fontFamily,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: '品牌設定已更新！前台將立即套用新設定。' });
        setSettings({
          ...settings!,
          brand_name: brandName.trim(),
          logo_url: logoUrl,
          font_family: fontFamily,
        });
        
        // 3 秒後清除訊息
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || '更新失敗' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: '更新失敗: ' + (err.message || '') });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/brand/upload-logo', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setLogoUrl(data.url);
        setMessage({ type: 'success', text: 'Logo 上傳成功！' });
        
        // 自動更新設定
        const selectedFont = AVAILABLE_FONTS.find(f => f.id === selectedFontId);
        const fontFamily = selectedFont?.cssFamily || (AVAILABLE_FONTS[0]?.cssFamily || 'var(--font-noto-serif-tc), serif');
        
        const updateRes = await fetch('/api/admin/brand', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            brand_name: brandName.trim() || settings?.brand_name,
            logo_url: data.url,
            font_family: fontFamily || settings?.font_family,
          }),
        });

        if (updateRes.ok) {
          setTimeout(() => setMessage(null), 3000);
        }
      } else {
        setMessage({ type: 'error', text: data.error || '上傳失敗' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: '上傳失敗: ' + (err.message || '') });
    } finally {
      setUploading(false);
      // 清除 input 值，允許重新選擇相同檔案
      e.target.value = '';
    }
  };

  // 即使還在載入，也顯示頁面結構，只是表單會顯示載入狀態

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">品牌設定</h1>
          <Link
            href="/admin"
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
          >
            ← 返回後台
          </Link>
        </div>

        {loading && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              <p className="text-blue-700">載入品牌設定中...</p>
            </div>
          </div>
        )}

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          {/* 補習班名稱 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              補習班名稱
            </label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="例如：名貫補習班"
            />
            <p className="mt-1 text-sm text-gray-500">
              此名稱將顯示在前台所有頁面的標題區域
            </p>
          </div>

          {/* Logo 上傳 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo 圖案
            </label>
            
            {/* 目前 Logo 預覽 */}
            {logoUrl && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">目前 Logo：</p>
                <div className="inline-block p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <img
                    src={logoUrl}
                    alt="目前 Logo"
                    className="max-w-[200px] max-h-[200px] object-contain"
                    onError={(e) => {
                      // 如果圖片載入失敗，顯示預設
                      (e.target as HTMLImageElement).src = '/Black and White Circle Business Logo.png';
                    }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center space-x-4">
              <label className="flex-1">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                  onChange={handleLogoUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <div className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer text-center disabled:opacity-50 disabled:cursor-not-allowed">
                  {uploading ? '上傳中...' : '選擇並上傳 Logo'}
                </div>
              </label>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              支援 PNG、JPEG、SVG、WebP 格式，建議大小不超過 5MB
            </p>
          </div>

          {/* 字型選擇 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              前台字型
            </label>
            <select
              value={selectedFontId}
              onChange={(e) => setSelectedFontId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {AVAILABLE_FONTS.map((font) => (
                <option key={font.id} value={font.id}>
                  {font.name} {font.description ? `- ${font.description}` : ''}
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm text-gray-500">
              選擇的字型將套用到前台所有頁面
            </p>
            
            {/* 字型預覽 */}
            {selectedFontId && AVAILABLE_FONTS && AVAILABLE_FONTS.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 mb-2">預覽：</p>
                <p
                  style={{
                    fontFamily: AVAILABLE_FONTS.find(f => f.id === selectedFontId)?.cssFamily || 'inherit',
                  }}
                  className="text-lg"
                >
                  這是 {AVAILABLE_FONTS.find(f => f.id === selectedFontId)?.name || '預設字型'} 的預覽效果
                </p>
              </div>
            )}
          </div>

          {/* 儲存按鈕 */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              onClick={handleSave}
              disabled={saving || !brandName.trim()}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '儲存中...' : '儲存設定'}
            </button>
          </div>
        </div>

        {/* 說明區塊 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">使用說明</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>修改設定後，前台頁面會立即套用新設定</li>
            <li>Logo 上傳後會自動更新，無需再次點擊儲存</li>
            <li>字型變更會影響前台所有頁面的文字顯示</li>
            <li>建議 Logo 使用透明背景的 PNG 或 SVG 格式</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

