import { Home, Calendar, Users, BookOpen, Bell } from "lucide-react";

interface MobileBottomNavProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export function MobileBottomNav({ activeView, onViewChange }: MobileBottomNavProps) {
  const navItems = [
    { id: "dashboard", label: "Início", icon: Home },
    { id: "agenda", label: "Agenda", icon: Calendar },
    { id: "atendimentos", label: "Atendimento", icon: Users },
    { id: "sermoes", label: "Sermões", icon: BookOpen },
    { id: "notificacoes", label: "Alertas", icon: Bell },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#002645] border-t border-[#002645]/20 z-50 safe-area-bottom max-w-md mx-auto shadow-lg">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              aria-label={item.label}
              aria-pressed={isActive}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-200 ${
                isActive 
                  ? "text-[#95C121]" 
                  : "text-white/60 hover:text-[#3261AB]"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "fill-[#95C121]/20 scale-110" : ""}`} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-xs ${isActive ? "font-medium" : ""}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}