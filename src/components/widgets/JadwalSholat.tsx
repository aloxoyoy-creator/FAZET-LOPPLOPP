import React, { useState } from 'react';
import { MapPin, Sparkles, Navigation } from 'lucide-react';

const WIDGETS = [
  {
    id: 'tasikmalaya',
    name: 'Tasikmalaya',
    url: 'https://sihat.kemenag.dev/widget/jadwal?wilayah=3278&tema=otomatis&aksen=emas',
  },
  {
    id: 'ciamis',
    name: 'Kawali, Ciamis',
    url: 'https://sihat.kemenag.dev/widget/jadwal?wilayah=320709&tema=otomatis&aksen=emas',
  },
  {
    id: 'tuban',
    name: 'Tuban',
    url: 'https://sihat.kemenag.dev/widget/jadwal?wilayah=3523&tema=otomatis&aksen=emas',
  }
];

export default function JadwalSholat() {
  const [activeTab, setActiveTab] = useState(WIDGETS[0].id);

  const activeWidget = WIDGETS.find(w => w.id === activeTab) || WIDGETS[0];

  return (
    <div className="w-full my-4">
      <div className="bg-white dark:bg-[#0f1219] rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-amber-400/10 blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-emerald-400/10 blur-3xl rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-xl text-amber-600 dark:text-amber-400">
                <Sparkles size={18} />
              </div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">Jadwal Sholat</h2>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Sumber Resmi Kementerian Agama RI</p>
          </div>

          {/* Location Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl overflow-x-auto hide-scrollbar">
            {WIDGETS.map((widget) => (
              <button
                key={widget.id}
                onClick={() => setActiveTab(widget.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                  activeTab === widget.id 
                    ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                }`}
              >
                <MapPin size={16} className={activeTab === widget.id ? "animate-bounce" : ""} />
                {widget.name}
              </button>
            ))}
          </div>
        </div>

        {/* Iframe Container */}
        <div className="relative w-full rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 min-h-[400px]">
          {/* Loading placeholder */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-3 -z-0">
            <Navigation className="w-8 h-8 animate-spin text-amber-400/50" />
            <span className="font-semibold text-sm animate-pulse">Menyiapkan jadwal wilayah {activeWidget.name}...</span>
          </div>
          
          <iframe 
            key={activeWidget.id}
            src={activeWidget.url}
            title={`Jadwal Sholat ${activeWidget.name} — SIHAT Kementerian Agama RI`}
            loading="lazy"
            className="relative z-10 w-full bg-transparent"
            style={{ width: '100%', maxWidth: '100%', height: '400px', border: 0, display: 'block' }}
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
}
