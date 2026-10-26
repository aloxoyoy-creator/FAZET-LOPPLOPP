import { useEffect, useState } from 'react';
import { IdCard, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getMyDigitalCard, subscribeMyDigitalCard, type DigitalIdCard } from '../../services/digitalCardService';

export default function DigitalIdCardBanner() {
  const { user } = useAuth();
  const [card, setCard] = useState<DigitalIdCard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    let active = true;
    setLoading(true);
    getMyDigitalCard()
      .then((c) => { if (active) setCard(c); })
      .catch(() => { /* silent: banner just won't show */ })
      .finally(() => { if (active) setLoading(false); });
    const unsubscribe = subscribeMyDigitalCard(user.id, (c) => setCard(c));
    return () => { active = false; unsubscribe(); };
  }, [user?.id]);

  // No card issued yet (admin hasn't created one for this user) -> render nothing.
  if (loading || !card) return null;

  return (
    <section className="group relative overflow-hidden rounded-[var(--tf-radius-card)] border border-[var(--tf-border)] bg-[#141311] p-5 sm:p-6 fade-up shadow-[0_18px_40px_rgba(12,11,10,0.22)] transition-all duration-300 hover:border-[#C8A96E]/40">
      <div className="pointer-events-none absolute right-[-60px] top-[-60px] h-56 w-56 rounded-full bg-[#C8A96E]/10 blur-3xl" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl border border-[#C8A96E]/30 bg-white/5">
            {card.photoUrl ? (
              <img src={card.photoUrl} alt={card.fullName} className="h-full w-full object-cover" />
            ) : (
              <UserRound size={24} className="text-[#C8A96E]" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#C8A96E]">
              <IdCard size={13} /> Identity Pass
            </div>
            <div className="mt-1 truncate text-xl font-medium tracking-tight text-[#F5F3EE]" style={{ fontFamily: 'var(--tf-font-display)' }}>
              {card.fullName}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#A39E95]">
              <span className="font-mono text-[11px] text-[#E5E0D5]">No. {card.cardNumber}</span>
              {card.idNumber && <span>/ {card.idNumber}</span>}
              <span>/ {card.roleLabel}</span>
              {card.classLabel && <span>/ {card.classLabel}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start rounded-full border border-[#C8A96E]/30 bg-[#C8A96E]/10 px-3.5 py-1.5 text-[11px] font-medium tracking-wide text-[#E5CFA0] sm:self-center">
          <ShieldCheck size={14} /> Verified Member
        </div>
      </div>
    </section>
  );
}
