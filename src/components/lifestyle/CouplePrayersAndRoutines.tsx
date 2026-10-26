import { useState } from 'react';
import Card from '../ui/Card';
import { BookMarked, Copy, Check, Heart, Sparkles, Compass } from 'lucide-react';
import { calculateOfflinePrayerTimes } from '../../utils/jadwalSholat';
import { getNowWIB } from '../../utils/timeUtils';

interface PrayerItem {
  id: string;
  title: string;
  arabic: string;
  latin: string;
  translation: string;
  note: string;
}

const PRAYERS: PrayerItem[] = [
  {
    id: 'p_1',
    title: 'Doa Kemudahan Belajar & Kelancaran Ujian',
    arabic: 'رَبِّ زِدْنِي عِلْمًا وَارْزُقْنِي فَهْمًا',
    latin: 'Robbi zidnii \'ilman warzuqnii fahman.',
    translation: 'Ya Tuhanku, tambahkanlah kepadaku ilmu pengetahuan dan berikanlah aku rezeki pemahaman yang baik.',
    note: 'Bacakan sebelum mulai membuka buku, mengerjakan modul TKA, atau tugas kuliah.',
  },
  {
    id: 'p_2',
    title: 'Doa Kelapangan Dada & Menghilangkan Cemas',
    arabic: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِّن لِّسَانِي يَفْقَهُوا قَوْلِي',
    latin: 'Robbisroh lii sodrii, wa yassir lii amrii, wahlul \'uqdatam mil lisaanii, yafqohuu qowlii.',
    translation: 'Ya Rabb-ku, lapangkanlah dadaku, mudahkanlah urusanku, dan lepaskanlah kekakuan dari lidahku agar mereka mengerti perkataanku.',
    note: 'Cocok dibaca saat merasa overthinking, grogi menjelang tryout, atau lelah mental.',
  },
  {
    id: 'p_3',
    title: 'Doa Keberkahan Hidup & Kebaikan Keluarga',
    arabic: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا',
    latin: 'Robbanaa hab lanaa min azwaajinaa wa dzurriyyaatinaa qurrota a\'yun, waj\'alnaa lil muttaqiina imaamaa.',
    translation: 'Ya Tuhan kami, anugerahkanlah kepada kami pasangan dan keturunan kami sebagai penyejuk hati (kami), dan jadikanlah kami pemimpin bagi orang-orang yang bertakwa.',
    note: 'Doa memohon ketenteraman jiwa, pasangan, dan generasi yang saleh serta diridhoi Allah SWT.',
  },
  {
    id: 'p_4',
    title: 'Doa Menghilangkan Kemalasan & Beban Pikiran',
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَأَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ',
    latin: 'Allaahumma innii a\'uudzu bika minal hammi wal hazan, wa a\'uudzu bika minal \'ajzi wal kasal.',
    translation: 'Ya Allah, sesungguhnya aku berlindung kepada-Mu dari rasa gundah dan sedih, dan aku berlindung kepada-Mu dari kelemahan dan kemalasan.',
    note: 'Penguat motivasi saat rasa mager atau burn out mulai melanda.',
  },
];

export default function CouplePrayersAndRoutines() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const now = getNowWIB();
  const prayerTimes = calculateOfflinePrayerTimes('Tuban', now);

  const handleCopy = async (prayer: PrayerItem) => {
    const text = `${prayer.title}\n\n${prayer.arabic}\n\n${prayer.latin}\n\nArtinya:\n"${prayer.translation}"`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(prayer.id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {}
  };

  return (
    <Card className="p-6 border-2 border-emerald-200/90 dark:border-emerald-900/40 bg-white dark:bg-[#0a0f1d] shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 rounded-2xl text-emerald-600 dark:text-emerald-300">
            <BookMarked size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              Doa Harian & Jadwal Ibadah Sholat
              <Sparkles size={16} className="text-emerald-500" />
            </h2>
            <p className="text-xs text-[var(--tf-text-muted)] mt-0.5">
              Kompilasi doa penyejuk hati untuk belajar, ketenangan jiwa, dan jadwal sholat Tuban (WIB)
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
          <Compass size={14} /> Sinkron Waktu Tuban (WIB)
        </div>
      </div>

      {/* Jadwal Sholat Tuban Bar */}
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-100 dark:border-emerald-900/40">
        <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 mb-3 flex flex-wrap items-center justify-between gap-1">
          <span>Waktu Sholat ({now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })})</span>
          <span className="text-[11px] font-medium font-mono text-slate-500">Imsak: {prayerTimes.imsak} WIB</span>
        </div>
        <div className="grid grid-cols-5 gap-2 text-center text-xs">
          {[
            { name: 'Subuh', time: prayerTimes.subuh },
            { name: 'Dzuhur', time: prayerTimes.dzuhur },
            { name: 'Ashar', time: prayerTimes.ashar },
            { name: 'Maghrib', time: prayerTimes.maghrib },
            { name: 'Isya', time: prayerTimes.isya },
          ].map(p => (
            <div key={p.name} className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/80 border border-emerald-100 dark:border-emerald-900/30 shadow-xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase">{p.name}</div>
              <div className="text-sm font-black text-emerald-700 dark:text-emerald-300 font-mono mt-0.5">{p.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Doa Cards Grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {PRAYERS.map(prayer => (
          <div
            key={prayer.id}
            className="p-5 rounded-2xl border-2 border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/20 dark:bg-emerald-950/10 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles size={14} className="text-emerald-500" />
                  {prayer.title}
                </h3>
                <button
                  onClick={() => handleCopy(prayer)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors"
                  title="Salin Doa"
                >
                  {copiedId === prayer.id ? (
                    <Check size={14} className="text-emerald-600" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>

              <div className="text-right font-serif text-lg text-emerald-950 dark:text-emerald-200 leading-loose mb-2 select-all">
                {prayer.arabic}
              </div>

              <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 italic mb-2">
                "{prayer.latin}"
              </div>

              <p className="text-xs text-[var(--tf-text-muted)] leading-relaxed">
                <strong>Artinya:</strong> {prayer.translation}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-emerald-100 dark:border-emerald-900/30 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
              {prayer.note}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
