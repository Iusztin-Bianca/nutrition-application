'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Leaf } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f5f0e5] px-6 py-10">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-[#8fc63e] rounded-full flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">
              <span className="text-gray-900">Nutrition </span>
              <span className="text-[#8fc63e]">Tracker</span>
            </span>
          </div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-4 h-4" /> Înapoi
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-sm p-8 flex flex-col gap-5">
          <h1 className="text-2xl font-bold text-gray-900">Politică de Confidențialitate</h1>
          <p className="text-xs text-gray-400">Ultima actualizare: iunie 2026</p>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-gray-800">1. Date colectate</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Colectăm adresa de email, parola (stocată criptat) și datele de profil pe care le furnizezi voluntar (nume, greutate, înălțime, vârstă, sex, nivel de activitate). Aceste date sunt necesare pentru funcționarea aplicației și calculul indicilor nutriționali personalizați.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-gray-800">2. Scopul prelucrării</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Datele sunt folosite exclusiv pentru furnizarea serviciilor aplicației Nutrition Tracker: autentificare, personalizarea planului nutrițional și calculul indicilor metabolici (IMC, BMR, MZT).
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-gray-800">3. Stocarea datelor</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Datele sunt stocate în baze de date securizate. Nu vindem, nu închiriem și nu partajăm datele tale cu terți în scop comercial.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-gray-800">4. Drepturile tale</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Conform GDPR, ai dreptul de acces, rectificare și ștergere a datelor. Poți solicita ștergerea contului din setările aplicației sau contactându-ne direct.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-gray-800">5. Contact</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Pentru orice întrebare legată de prelucrarea datelor, ne poți contacta la adresa de email asociată aplicației.
            </p>
          </section>
        </div>

      </div>
    </div>
  );
}
