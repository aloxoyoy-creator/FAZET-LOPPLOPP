import { Award, Trophy } from 'lucide-react';
import Reveal from '../ui/Reveal';
import type { Achievement, AchievementSummary } from '../../services/achievementService';

const TIER_TONE: Record<Achievement['tier'], string> = {
  bronze: 'border-[#9E7B42]/25 bg-[#9E7B42]/5',
  silver: 'border-[var(--tf-border)] bg-[var(--tf-bg-subtle)]/60',
  gold: 'border-[#C8A96E]/40 bg-[#C8A96E]/10',
  platinum: 'border-[var(--tf-primary)]/30 bg-[var(--tf-primary-subtle)]',
};

export default function AchievementsShowcase({ summary }: { summary: AchievementSummary }) {
  return (
    <section className="rounded-[var(--tf-radius-card)] border border-[var(--tf-border)] bg-[var(--tf-bg-surface)] p-5 sm:p-6 shadow-[var(--tf-shadow-raised)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-lg font-medium text-[var(--tf-text-primary)]" style={{ fontFamily: 'var(--tf-font-display)' }}>
            <Trophy size={17} className="text-[var(--tf-accent)]" /> Pencapaian & Milestone
          </div>
          <p className="mt-0.5 text-xs text-[var(--tf-text-muted)]">
            {summary.unlockedCount} dari {summary.totalCount} pencapaian telah terbuka.
          </p>
        </div>
        {summary.nextUp && (
          <div className="hidden text-right sm:block">
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--tf-text-muted)]">Target Berikutnya</div>
            <div className="text-xs font-semibold text-[var(--tf-text-primary)]">{summary.nextUp.title}</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {summary.achievements.map((achievement, index) => {
          const ratio = achievement.target > 0 ? Math.min(1, achievement.progress / achievement.target) : 0;
          return (
            <Reveal key={achievement.id} delay={index * 45}>
              <div
                className={`rounded-xl border p-3.5 transition-all ${TIER_TONE[achievement.tier]} ${
                  achievement.unlocked ? 'opacity-100' : 'opacity-65'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--tf-border)] bg-[var(--tf-bg-surface)] text-[var(--tf-accent)]">
                    <Award size={15} />
                  </span>
                  <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--tf-text-muted)]">
                    {achievement.tier}
                  </span>
                </div>
                <div className="mt-2.5 text-xs font-semibold text-[var(--tf-text-primary)]">{achievement.title}</div>
                <div className="mt-0.5 text-[11px] leading-4 text-[var(--tf-text-muted)]">{achievement.description}</div>
                <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--tf-bg-subtle)]">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(4, ratio * 100)}%`,
                      background: achievement.unlocked ? 'var(--tf-accent)' : 'var(--tf-text-muted)',
                    }}
                  />
                </div>
                <div className="mt-1 text-right text-[10px] font-mono text-[var(--tf-text-muted)]">
                  {Math.min(achievement.progress, achievement.target)}/{achievement.target}
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
