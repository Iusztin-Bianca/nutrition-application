import { CheckCircle, User, Menu, Leaf } from 'lucide-react';

export default function Home() {
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
          <User className="w-6 h-6" />
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
