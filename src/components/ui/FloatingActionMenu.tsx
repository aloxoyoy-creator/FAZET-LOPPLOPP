import { useState } from "react";
import { Plus, CheckSquare, GraduationCap, CalendarClock, X } from "lucide-react";
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
      color: "bg-blue-500",
    },
    {
      label: "Lihat Jadwal Les",
      icon: GraduationCap,
      onClick: () => {
        navigate("/tutoring");
        setIsOpen(false);
      },
      color: "bg-purple-500",
    },
    {
      label: "Lihat Jadwal Sekolah",
      icon: CalendarClock,
      onClick: () => {
        navigate("/schedule");
        setIsOpen(false);
      },
      color: "bg-emerald-500",
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse items-end gap-3">
      <button
        onClick={toggleMenu}
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg shadow-black/20 transition-transform duration-300",
          isOpen ? "rotate-45 bg-[var(--tf-danger)]" : "bg-[var(--tf-primary)] hover:scale-105"
        )}
      >
        <Plus size={24} className="transition-transform duration-300" />
      </button>

      <div
        className={cn(
          "flex flex-col-reverse items-end gap-3 transition-all duration-300 origin-bottom",
          isOpen ? "scale-100 opacity-100" : "pointer-events-none scale-75 opacity-0"
        )}
      >
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <div
              key={action.label}
              className={cn(
                "flex items-center gap-3 transition-all duration-300",
                isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              )}
              style={{ transitionDelay: isOpen ? `${index * 50}ms` : "0ms" }}
            >
              <span className="rounded-lg bg-[var(--tf-surface)] px-3 py-1.5 text-xs font-semibold shadow-md">
                {action.label}
              </span>
              <button
                onClick={action.onClick}
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full text-white shadow-md hover:scale-105 transition-transform",
                  action.color
                )}
              >
                <Icon size={20} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
