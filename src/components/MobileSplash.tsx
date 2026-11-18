import { BookOpen } from "lucide-react";

export function MobileSplash() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002645] via-[#3261AB] to-[#95C121] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-60 h-60 bg-[#95C121]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "0.5s" }}></div>
      </div>

      {/* Logo and content */}
      <div className="relative z-10 text-center">
        <div className="w-32 h-32 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/20 animate-bounce">
          <BookOpen className="w-16 h-16 text-white" strokeWidth={2} />
        </div>

        <h1 className="text-4xl text-white mb-3 tracking-tight">
          PastorHub
        </h1>
        <p className="text-lg text-white/80 mb-12">
          Gestão Pastoral Inteligente
        </p>

        {/* Loading indicator */}
        <div className="flex justify-center items-center gap-2 mb-4">
          <div className="w-3 h-3 bg-[#95C121] rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-[#95C121] rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
          <div className="w-3 h-3 bg-[#95C121] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
        </div>
        
        <p className="text-sm text-white/60">Carregando...</p>
      </div>

      {/* Version footer */}
      <div className="absolute bottom-8 text-center">
        <p className="text-xs text-white/40">Versão 1.0.0</p>
      </div>
    </div>
  );
}
