import { useEffect, useState } from 'react';
import { Quote } from 'lucide-react';
import Card from '../ui/Card';

const quotes = [
  { text: "Pendidikan adalah senjata paling ampuh yang bisa kamu gunakan untuk mengubah dunia.", author: "Nelson Mandela" },
  { text: "Jangan pernah berhenti belajar, karena hidup tak pernah berhenti mengajarkan.", author: "Anonim" },
  { text: "Hiduplah seolah engkau mati besok. Belajarlah seolah engkau hidup selamanya.", author: "Mahatma Gandhi" },
  { text: "Masa depan adalah milik mereka yang menyiapkan hari ini.", author: "Malcolm X" },
  { text: "Pendidikan bukanlah persiapan untuk hidup; pendidikan adalah kehidupan itu sendiri.", author: "John Dewey" },
  { text: "Tujuan pendidikan itu untuk mempertajam kecerdasan dan memperkukuh kemauan serta memperhalus perasaan.", author: "Tan Malaka" },
  { text: "Agama tanpa ilmu adalah buta. Ilmu tanpa agama adalah lumpuh.", author: "Albert Einstein" },
];

export default function DailyQuote() {
  const [quote, setQuote] = useState(quotes[0]);

  useEffect(() => {
    // Get deterministic quote based on day of year
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    const oneDay = 1000 * 60 * 60 * 24;
    const day = Math.floor(diff / oneDay);
    
    setQuote(quotes[day % quotes.length]);
  }, []);

  return (
    <Card className="p-5 relative overflow-hidden bg-gradient-to-br from-[var(--tf-bg-surface)] to-[var(--tf-bg-subtle)] border-[var(--tf-primary-subtle)]">
      <Quote size={40} className="absolute -right-2 -top-2 text-[var(--tf-primary)]/10" />
      <div className="relative z-10">
        <p className="text-sm italic text-[var(--tf-text-primary)] font-medium leading-relaxed">"{quote.text}"</p>
        <p className="text-xs text-[var(--tf-text-muted)] mt-2 font-semibold">— {quote.author}</p>
      </div>
    </Card>
  );
}
