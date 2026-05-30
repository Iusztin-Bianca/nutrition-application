'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, User, Menu, Leaf, LogOut, Settings, Trash2, BarChart2, Plus } from 'lucide-react';
import { logout, deleteAccount } from '@/services/authService';
import { Button } from '@/components/ui/button';

export default function Home() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [hamburgerOpen, setHamburgerOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
      if (hamburgerRef.current && !hamburgerRef.current.contains(e.target as Node)) {
        setHamburgerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleLogout() {
    logout();
    router.push('/login');
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      await deleteAccount();
      logout();
      router.push('/');
    } catch (err: any) {
      setDeleteError(err.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f0e5]">

      {/* Modal confirmare ștergere cont */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Șterge contul</h2>
            <p className="text-gray-500 text-sm text-center">
              Ești sigur că vrei să îți ștergi contul? Această acțiune este <strong>ireversibilă</strong> și toate datele tale vor fi șterse.
            </p>
            {deleteError && <p className="text-red-500 text-sm text-center">{deleteError}</p>}
            <Button
              className="w-full bg-red-500 hover:bg-red-600 text-white rounded-2xl h-11"
              onClick={handleDeleteAccount}
              disabled={deleting}
            >
              {deleting ? 'Se șterge...' : 'Da, șterge contul'}
            </Button>
            <button
              onClick={() => { setShowDeleteModal(false); setDeleteError(''); }}
              className="w-full h-10 text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Anulează
            </button>
          </div>
        </div>
      )}

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
                  onClick={() => { setMenuOpen(false); router.push('/complete-profile?mode=edit'); }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Settings className="w-4 h-4 text-gray-400" />
                  Editeaza Profil
                </button>
                <button
                  onClick={() => { setMenuOpen(false); router.push('/indices'); }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <BarChart2 className="w-4 h-4 text-gray-400" />
                  Vizualizează indici
                </button>
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={() => { setMenuOpen(false); setShowDeleteModal(true); }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Șterge cont
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
          <div className="relative" ref={hamburgerRef}>
            <button onClick={() => setHamburgerOpen(!hamburgerOpen)}>
              <Menu className="w-6 h-6" />
            </button>
            {hamburgerOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg py-2 z-50">
                <button
                  onClick={() => { setHamburgerOpen(false); router.push('/foods/create'); }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4 text-gray-400" />
                  Creează aliment
                </button>
              </div>
            )}
          </div>
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
