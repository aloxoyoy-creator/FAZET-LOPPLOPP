import { useEffect, useState } from 'react';
import { Quote } from 'lucide-react';
import Card from '../ui/Card';

const quotes = [
  { text: "Pendidikan adalah senjata paling ampuh yang bisa kamu gunakan untuk mengubah dunia.", author: "Nelson Mandela" },
  { text: "Jangan pernah berhenti belajar, karena hidup tak pernah berhenti mengajarkan.", author: "Pepatah Klasik" },
  { text: "Hiduplah seolah engkau mati besok. Belajarlah seolah engkau hidup selamanya.", author: "Mahatma Gandhi" },
  { text: "Masa depan adalah milik mereka yang menyiapkan hari ini dengan kesungguhan.", author: "Malcolm X" },
  { text: "Pendidikan bukanlah persiapan untuk hidup; pendidikan adalah kehidupan itu sendiri.", author: "John Dewey" },
  { text: "Tujuan pendidikan itu untuk mempertajam kecerdasan, memperkukuh kemauan, serta memperhalus perasaan.", author: "Tan Malaka" },
  { text: "Ilmu pengetahuan tanpa ketulusan hati tidak akan pernah mencapai kebijaksanaan sejati.", author: "Albert Einstein" },
];

export default function DailyQuote() {
  const [quote, setQuote] = useState(quotes[0]);

  useEffect(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    const oneDay = 1000 * 60 * 60 * 24;
    const day = Math.floor(diff / oneDay);
    setQuote(quotes[day % quotes.length]);
  }, []);

  return (
    <Card className="p-5 sm:p-6 relative overflow-hidden bg-[var(--tf-bg-surface)] border border-[var(--tf-border)] flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="studio-eyebrow">Refleksi Harian</span>
        <Quote size={16} className="text-[var(--tf-accent)] opacity-60" />
      </div>
      <p className="font-serif text-base sm:text-lg italic text-[var(--tf-text-primary)] leading-relaxed">
        &ldquo;{quote.text}&rdquo;
      </p>
      <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--tf-text-muted)] mt-3 font-medium">
        &mdash; {quote.author}
      </p>
    </Card>
  );
}
