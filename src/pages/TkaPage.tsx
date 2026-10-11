import React, { useState } from 'react';
import { BookOpen, Target, FileText, CheckCircle2, ChevronRight, Lock, Play, BarChart3, Info } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { useNavigate } from 'react-router-dom';

const SUBTESTS = [
  { id: 'pu', name: 'Penalaran Umum (PU)', progress: 75, total: 30, completed: 22 },
  { id: 'pk', name: 'Pengetahuan Kuantitatif (PK)', progress: 45, total: 40, completed: 18 },
  { id: 'ppu', name: 'Pengetahuan & Pemahaman Umum', progress: 80, total: 20, completed: 16 },
  { id: 'pbm', name: 'Pemahaman Bacaan & Menulis', progress: 60, total: 20, completed: 12 },
  { id: 'lit_id', name: 'Literasi Bahasa Indonesia', progress: 85, total: 30, completed: 25 },
  { id: 'lit_en', name: 'Literasi Bahasa Inggris', progress: 40, total: 20, completed: 8 },
  { id: 'pm', name: 'Penalaran Matematika', progress: 55, total: 20, completed: 11 },
];

import { tkaQuestions } from '../data/tkaQuestions';

export default function TkaPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'materi' | 'tryout'>('materi');
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);

  const currentQ = tkaQuestions[currentQuestionIndex];

  if (isFinished) {
    let score = 0;
    tkaQuestions.forEach(q => {
      if (answers[q.id] === q.correctAnswerId) score += 1;
    });
    const finalScore = Math.round((score / tkaQuestions.length) * 1000);

    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-24 text-center mt-12">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-3xl font-extrabold mb-2">Ujian Selesai!</h2>
        <p className="text-slate-500 mb-8">Terima kasih telah mengikuti Simulasi TKA & SNBT.</p>
        <Card className="p-8 max-w-sm mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 shadow-xl">
          <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Skor Akhir Anda</div>
          <div className="text-6xl font-black text-blue-700">{finalScore}</div>
          <div className="mt-4 text-sm text-blue-600 font-medium">Luar biasa! Tingkatkan terus belajarmu.</div>
        </Card>
        <button onClick={() => { setIsFinished(false); setQuizStarted(false); setAnswers({}); setCurrentQuestionIndex(0); }} className="mt-8 bg-slate-900 text-white font-bold py-3 px-8 rounded-xl">
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  if (quizStarted) {
    return (
      <div className="max-w-5xl mx-auto pb-24">
        <header className="flex items-center justify-between mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="bg-rose-100 text-rose-600 p-2 rounded-lg"><Target size={24} /></div>
            <div>
              <h1 className="font-bold text-slate-800">Simulasi TKA & SNBT</h1>
              <p className="text-xs text-slate-500 font-medium">Subtes: {currentQ.subject}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-bold text-slate-800">Soal {currentQuestionIndex + 1} / {tkaQuestions.length}</div>
              <div className="text-xs text-slate-500">Sisa Waktu: 29:59</div>
            </div>
            <button onClick={() => setIsFinished(true)} className="bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold py-2 px-4 rounded-lg transition-colors">
              Akhiri Ujian
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <Card className="p-6 md:p-8 border-slate-200 shadow-sm text-slate-800">
              {currentQ.imageUrl && (
                <div className="mb-6 flex justify-center">
                  <img src={currentQ.imageUrl} alt="Ilustrasi Soal" className="max-w-full max-h-[300px] object-contain rounded-xl border border-slate-100 shadow-sm" />
                </div>
              )}
              {currentQ.passage && (
                <div className="mb-6 pb-6 border-b border-slate-100">
                  <div className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">Bacaan</div>
                  <div className="prose prose-slate max-w-none whitespace-pre-wrap text-[15px] leading-relaxed">
                    {currentQ.passage}
                  </div>
                </div>
              )}
              <div className="text-lg font-semibold mb-6">
                {currentQuestionIndex + 1}. {currentQ.text}
              </div>
              <div className="space-y-3">
                {currentQ.options.map((opt, i) => {
                  const isSelected = answers[currentQ.id] === opt.id;
                  const letter = String.fromCharCode(65 + i);
                  return (
                    <label key={opt.id} className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50'}`}>
                      <input 
                        type="radio" 
                        name={`q-${currentQ.id}`} 
                        value={opt.id}
                        checked={isSelected}
                        onChange={() => setAnswers(prev => ({ ...prev, [currentQ.id]: opt.id }))}
                        className="mt-1 w-4 h-4 text-blue-600"
                      />
                      <div className="flex-1">
                        <span className="font-bold mr-2 text-slate-500">{letter}.</span>
                        <span className="text-[15px] whitespace-pre-wrap leading-relaxed">{opt.text}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </Card>

            <div className="flex justify-between items-center">
              <button 
                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
              >
                Kembali
              </button>
              <button 
                onClick={() => {
                  if (currentQuestionIndex === tkaQuestions.length - 1) {
                    setIsFinished(true);
                  } else {
                    setCurrentQuestionIndex(prev => Math.min(tkaQuestions.length - 1, prev + 1));
                  }
                }}
                className="px-8 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20"
              >
                {currentQuestionIndex === tkaQuestions.length - 1 ? 'Selesai' : 'Selanjutnya'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-5 sticky top-24 border-slate-200">
              <h3 className="font-bold text-sm mb-4 text-slate-800">Navigasi Soal</h3>
              <div className="grid grid-cols-5 gap-2">
                {tkaQuestions.map((q, idx) => {
                  const isAnswered = !!answers[q.id];
                  const isActive = idx === currentQuestionIndex;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`h-10 rounded-lg text-sm font-bold border transition-all ${
                        isActive 
                          ? 'border-blue-600 bg-blue-600 text-white shadow-md' 
                          : isAnswered 
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                            : 'border-slate-200 bg-white text-slate-500 hover:border-blue-300'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24">
      <header className="mb-6">
        <Badge variant="warning" className="mb-3 inline-flex shadow-[0_0_15px_rgba(251,146,60,0.4)]">
          FAZET ACADEMY PRO
        </Badge>
        <h1 className="text-3xl font-extrabold flex items-center gap-3 text-slate-900 dark:text-white">
          <Target className="text-rose-500" size={32} />
          Preparation Center TKA & SNBT
        </h1>
        <p className="mt-2 text-slate-500 font-medium">Pusat komando pembelajaran intensif untuk menembus PTN impian.</p>
      </header>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-fit mb-6">
        <button 
          onClick={() => setActiveTab('materi')} 
          className={`flex-1 sm:px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'materi' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Materi & Silabus
        </button>
        <button 
          onClick={() => setActiveTab('tryout')} 
          className={`flex-1 sm:px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'tryout' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Simulasi TryOut
        </button>
      </div>

      {activeTab === 'materi' && (
        <div className="space-y-4 fade-up">
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <Card className="p-5 bg-emerald-50 border-emerald-100">
              <div className="text-emerald-600 mb-2"><BookOpen size={24} /></div>
              <div className="text-2xl font-black text-emerald-700">112</div>
              <div className="text-sm font-bold text-emerald-600/80">Modul Selesai</div>
            </Card>
            <Card className="p-5 bg-blue-50 border-blue-100">
              <div className="text-blue-600 mb-2"><CheckCircle2 size={24} /></div>
              <div className="text-2xl font-black text-blue-700">62%</div>
              <div className="text-sm font-bold text-blue-600/80">Progres Keseluruhan</div>
            </Card>
            <Card className="p-5 bg-amber-50 border-amber-100">
              <div className="text-amber-600 mb-2"><Play size={24} /></div>
              <div className="text-2xl font-black text-amber-700">8</div>
              <div className="text-sm font-bold text-amber-600/80">Modul Sedang Dipelajari</div>
            </Card>
          </div>

          <h3 className="text-lg font-bold">Silabus Pembelajaran</h3>
          <div className="grid gap-4">
            {SUBTESTS.map((sub) => (
              <Card key={sub.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-5 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 mb-1">{sub.name}</h4>
                  <div className="text-sm text-slate-500 mb-3">{sub.completed} dari {sub.total} sub-materi dikuasai</div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${
                        sub.progress >= 80 ? 'bg-emerald-500' : sub.progress >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                      }`} 
                      style={{ width: `${sub.progress}%` }} 
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <div className="text-xl font-black">{sub.progress}%</div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Penguasaan</div>
                  </div>
                  <div className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'tryout' && (
        <div className="space-y-6 fade-up">
          <Card className="p-8 text-center border-dashed border-2 bg-slate-50/50">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock size={32} />
            </div>
            <h3 className="text-xl font-extrabold mb-2">TryOut Akbar Nasional #4</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-6">Paket soal simulasi terbaru berbasis SNBT 2026. Mencakup 7 subtes dengan durasi 195 Menit. Kerjakan dengan fokus!</p>
            <button onClick={() => setQuizStarted(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all hover:scale-105 shadow-lg shadow-blue-600/20">
              Mulai Ujian Sekarang
            </button>
          </Card>

          <div>
            <h3 className="text-lg font-bold mb-4">Riwayat Ujian (TryOut)</h3>
            <div className="space-y-3">
              {[3, 2, 1].map((num, i) => (
                <Card key={num} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center font-black">
                      #{num}
                    </div>
                    <div>
                      <h4 className="font-bold">TryOut Akbar Nasional #{num}</h4>
                      <div className="text-sm text-slate-500">{15 - i * 4} Oktober 2025</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-slate-800">{590 + i * 25}</div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Skor Akhir</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
