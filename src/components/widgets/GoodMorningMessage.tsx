import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Heart, Sparkles, RefreshCw, Sun } from 'lucide-react';

// Koleksi pesan pagi yang super manja, manis, dan romantis khusus buat pacar
const messages: string[] = [
  'Selamat pagi bidadari manisnya aku! 🥺💖 Bangun yuk cintaaa, kangen banget tauu... peluk erat bertubi-tubi muaaach!',
  'Good monwiiing pacar lucunya akuuu! ☀️ Bangun tidur jangan cemberut yaa, senyum gemesmu itu sumber energi duniaku hari ini! 🥰',
  'Pagi sayangku cintaku semestaku! ✨ Hari ini harus hepi yaa, jangan cape-cape belajarnya. Inget ada aku yang selalu sayang & bangga banget sama kamu ❤️',
  'Ayanggg udah bangun beluum? Kalo belum bangun aku ciumin pipinya sampai melek nih! 😚 Semangat beraktivitas ya cintaku tersayang!',
  'Selamat pagi bayik besarku! 🧸 Minum air putih dulu yuk manis, terus sarapan yang enak. Hari ini kita berjuang bareng lagi ya sayaaang! 🌸',
  'Good morning cinta hatiku! 🌹 Dari detik pertama buka mata sampai nanti mau tidur lagi, pikiran dan doa aku selalu isinya kamu seorang.',
  'Pagi maniss! Boleh minta senyum pertamamu hari ini gak? Buat jadi jimat penyemangat aku seharian ini hehehe... I love you so much! 💖',
  'Halo kesayangan aku! 🥞 Jangan lupa sarapan yaa sayang, perutnya jangan dibiarin kosong, nanti lemes aku yang sedih & kepikiran 🥺',
  'Selamat pagi rumah ternyamanku. Apapun yang terjadi hari ini, inget ya sayang kalau kamu punya aku yang selalu ada buat kamu. Semangat ya cinta! 💕',
  'Pagi cintaaa! Yuk bangun yuk, hirup udara pagi yang segar. Dunia beruntung banget punya kamu yang secantik, seimut, dan sebaik ini! ☀️🥰',
  'Good monwing ayangku yang gemoyyy! 🐣 Hari ini kalau ada hal berat, tarik napas dan bayangin aku lagi elus rambut kamu yaa. Love you pol! ❤️',
  'Pagi sayang! Jangan lupa senyum manisnya yaa, biar harimu semanis tatapan mata kamu ke aku saat kita lagi barengan. Muaaach! 💋'
];

/**
 * GoodMorningMessage renders a sweet, affectionate greeting for the user's partner.
 * Supports refreshing to reveal different pampered messages.
 */
export const GoodMorningMessage: React.FC = () => {
  const [msg, setMsg] = useState<string>('');
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const pickRandom = () => {
    setIsAnimating(true);
    let newIdx = Math.floor(Math.random() * messages.length);
    if (messages.length > 1 && messages[newIdx] === msg) {
      newIdx = (newIdx + 1) % messages.length;
    }
    setMsg(messages[newIdx]);
    setTimeout(() => setIsAnimating(false), 300);
  };

  useEffect(() => {
    pickRandom();
  }, []);

  return (
    <Card className="p-6 border-2 border-rose-300/80 bg-gradient-to-br from-rose-50/80 via-white to-pink-50/70 dark:from-rose-950/30 dark:via-[#0c1222] dark:to-pink-950/20 shadow-md">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-rose-100 dark:bg-rose-900/60 rounded-xl text-rose-500 shadow-sm">
            <Sun size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-lg font-bold text-rose-600 dark:text-rose-300">
                Good Monwing, Sayangkuu!
              </h2>
              <Heart size={16} className="text-rose-500 fill-rose-500" />
            </div>
            <p className="text-xs text-[var(--tf-text-muted)]">
              Pesan manja harian spesial buat pacar tersayang
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-300 bg-rose-100/80 dark:bg-rose-900/40 px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-800">
          <Sparkles size={12} /> Manja & Romantis
        </span>
      </div>

      <div className="my-4 p-4 rounded-2xl bg-white/80 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 backdrop-blur-sm">
        <p className={`text-base font-medium leading-relaxed text-rose-950 dark:text-rose-100 transition-opacity duration-300 ${isAnimating ? 'opacity-30 scale-98' : 'opacity-100 scale-100'}`}>
          "{msg}"
        </p>
      </div>

      <div className="flex items-center justify-end">
        <Button
          onClick={pickRandom}
          size="sm"
          className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-rose-300/50 hover:shadow-rose-400/50 text-xs px-3.5 py-2 rounded-xl"
          icon={<RefreshCw size={13} className={isAnimating ? 'animate-spin' : ''} />}
        >
          Ganti Pesan Manja ✨
        </Button>
      </div>
    </Card>
  );
};

export default GoodMorningMessage;
