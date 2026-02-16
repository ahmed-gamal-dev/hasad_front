'use client';

import Usermenu from "./Usermenu";
import { useTranslation } from '@/contexts/SimpleTranslationContext';

export default function Navbar() {
  const { translate, language, setLanguage } = useTranslation();

  return (
    <header className="bg-white border-b border-primary-100 px-6 py-3">
      <div className="flex items-center justify-end gap-4">
        {/* Language Selector */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌐</span>
         
          {/* <select suppressHydrationWarning  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"value={language} onChange={(e) => setLanguage(e.target.value)}> */}
      <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="en">🇬🇧 English</option>
            <option value="es">🇪🇸 Español</option>
            <option value="fr">🇫🇷 Français</option>
            <option value="de">🇩🇪 Deutsch</option>
            <option value="it">🇮🇹 Italiano</option>
            <option value="pt">🇵🇹 Português</option>
            <option value="ru">🇷🇺 Русский</option>
            <option value="ja">🇯🇵 日本語</option>
            <option value="ko">🇰🇷 한국어</option>
            <option value="zh-CN">🇨🇳 中文</option>
            <option value="ar">🇸🇦 العربية</option>
            <option value="hi">🇮🇳 हिन्दी</option>
          </select>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <Usermenu/>
        </div>
      </div>
    </header>
  );
}