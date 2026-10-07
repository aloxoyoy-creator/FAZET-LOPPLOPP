import { useState } from "react";
import { Plus, CheckSquare, GraduationCap, CalendarClock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";

interface FloatingActionMenuProps {
  onAddTask: () => void;
}

export default function FloatingActionMenu({ onAddTask }: FloatingActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

  const actions = [
    {
      label: "Tambah Tugas",
      icon: CheckSquare,
      onClick: () => {
        onAddTask();
        setIsOpen(false);
      },
      color: "bg-blue-500 shadow-blue-500/50",
    },
    {
      label: "Lihat Jadwal Les",
      icon: GraduationCap,
      onClick: () => {
        navigate("/tutoring");
        setIsOpen(false);
      },
      color: "bg-purple-500 shadow-purple-500/50",
    },
    {
      label: "Lihat Jadwal Sekolah",
      icon: CalendarClock,
      onClick: () => {
        navigate("/schedule");
        setIsOpen(false);
      },
      color: "bg-emerald-500 shadow-emerald-500/50",
    },
  ];

  return (
    <div className="fixed bottom-20 right-5 lg:bottom-10 lg:right-10 z-[60] flex flex-col-reverse items-end gap-4">
      {/* Tombol Utama dengan animasi pulse dan glow */}
      <div className="relative">
        {/* Glow effect yang berdenyut */}
        <div className="absolute inset-0 rounded-full bg-[var(--tf-primary)] animate-ping opacity-75 duration-1000"></div>
        <button
          onClick={toggleMenu}
          className={cn(
            "relative flex h-16 w-16 items-center justify-center rounded-full text-white shadow-2xl transition-all duration-500 z-10",
            isOpen 
              ? "rotate-[135deg] bg-[var(--tf-danger)] shadow-[var(--tf-danger)]/50 scale-110" 
              : "bg-[var(--tf-primary)] shadow-[var(--tf-primary)]/50 hover:scale-110 hover:shadow-3xl hover:-translate-y-1 animate-pulse"
          )}
        >
          <Plus size={32} strokeWidth={2.5} className="transition-transform duration-500" />
        </button>
      </div>

      {/* Menu item dengan animasi muncul dari bawah dan berputar */}
      <div
        className={cn(
          "flex flex-col-reverse items-end gap-4 transition-all duration-500 origin-bottom",
          isOpen ? "scale-100 opacity-100 translate-y-0" : "pointer-events-none scale-50 opacity-0 translate-y-10"
        )}
      >
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <div
              key={action.label}
              className={cn(
                "flex items-center gap-3 transition-all duration-500 ease-out",
                isOpen 
                  ? "translate-x-0 opacity-100 rotate-0" 
                  : "translate-x-10 opacity-0 rotate-12"
              )}
              style={{ transitionDelay: isOpen ? `${index * 75}ms` : "0ms" }}
            >
              <span className="rounded-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-4 py-2 text-sm font-bold shadow-xl border border-white/20">
                {action.label}
              </span>
              <button
                onClick={action.onClick}
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-all hover:scale-125 hover:-translate-y-2 hover:rotate-12 duration-300",
                  action.color
                )}
              >
                <Icon size={24} className="animate-bounce" style={{ animationDuration: '2s' }} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
