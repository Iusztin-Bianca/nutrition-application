'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, User, Menu, Leaf, LogOut, Settings } from 'lucide-react';
import { logout } from '@/services/authService';

export default function Home() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleLogout() {
    logout();
    router.push('/login');
  }

  return (
    <div className="min-h-screen bg-[#f5f0e5]">

      {/* Navbar */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-[#8fc63e] rounded-full flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">
            <span className="text-gray-900">Nutrition </span>
            <span className="text-[#8fc63e]">Tracker</span>
          </span>
        </div>
        <div className="flex items-center gap-4 text-gray-700">
          <div className="relative" ref={menuRef}>
            <button onClick={() => setMenuOpen(!menuOpen)}>
              <User className="w-6 h-6" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg py-2 z-50">
                <button
                  onClick={() => { setMenuOpen(false); router.push('/profile'); }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Settings className="w-4 h-4 text-gray-400" />
                  Editare Profil
                </button>
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  Deconectare
                </button>
              </div>
            )}
          </div>
          <Menu className="w-6 h-6" />
        </div>
      </header>

      {/* Hero */}
      <main className="px-6 pt-10 pb-16 max-w-2xl">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 border border-gray-300 rounded-full px-4 py-2 text-sm text-gray-700 mb-8">
          ✨ Nutriție inteligentă pentru fiecare zi
        </div>

        {/* Heading */}
        <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-6">
          Mănâncă <span className="text-[#8fc63e]">sănătos</span>,<br />
          trăiește <span className="text-[#8fc63e]">echilibrat</span>.
        </h1>

        {/* Description */}
        <p className="text-gray-700 text-lg leading-relaxed mb-8">
          Bun venit la <strong>Nutrition Tracker</strong>! Aplicația care îți transformă alimentația
          într-un aliat al sănătății. Urmărește caloriile, descoperă meniuri personalizate
          și construiește obiceiuri durabile.
        </p>

        {/* Features */}
        <div className="grid grid-cols-2 gap-3">
          {[
            'Calculator de calorii precis',
            'Creare meniuri personalizate',
            'Rețete pentru toate nivelurile',
            'Sincronizare pe orice dispozitiv',
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#8fc63e] flex-shrink-0" />
              <span className="text-gray-700 text-sm">{feature}</span>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
