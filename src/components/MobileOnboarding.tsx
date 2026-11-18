import { useState } from "react";
import { Button } from "./ui/button";
import { ChevronRight, Calendar, Users, BookOpen, Cloud, Check } from "lucide-react";

interface MobileOnboardingProps {
  onComplete: () => void;
}

export function MobileOnboarding({ onComplete }: MobileOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Bem-vindo ao PastorHub",
      description: "Sua ferramenta completa para gestão pastoral mobile",
      icon: BookOpen,
      gradient: "from-[#002645] to-[#3261AB]",
    },
    {
      title: "Agenda Inteligente",
      description: "Sincronize com Google, Microsoft e Apple Calendar",
      icon: Calendar,
      gradient: "from-[#3261AB] to-[#95C121]",
    },
    {
      title: "Gestão de Atendimentos",
      description: "Organize atendimentos, visitações e aconselhamentos",
      icon: Users,
      gradient: "from-[#95C121] to-[#002645]",
    },
    {
      title: "Caderno do Pastor",
      description: "Crie sermões com IA da OpenAI e gerencie sua biblioteca",
      icon: BookOpen,
      gradient: "from-[#002645] to-[#95C121]",
    },
    {
      title: "Modo Offline",
      description: "Trabalhe sem internet, seus dados ficam salvos localmente",
      icon: Cloud,
      gradient: "from-[#3261AB] to-[#002645]",
    },
  ];

  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002645] via-[#3261AB] to-[#95C121] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-10 w-60 h-60 bg-[#95C121]/20 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Icon */}
        <div className={`w-32 h-32 mx-auto mb-8 rounded-3xl bg-gradient-to-br ${currentStepData.gradient} flex items-center justify-center shadow-2xl`}>
          <currentStepData.icon className="w-16 h-16 text-white" />
        </div>

        {/* Content */}
        <div className="text-center mb-12">
          <h1 className="text-3xl text-white mb-4">
            {currentStepData.title}
          </h1>
          <p className="text-lg text-white/80">
            {currentStepData.description}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? "w-8 bg-[#95C121]"
                  : index < currentStep
                  ? "w-2 bg-white/60"
                  : "w-2 bg-white/30"
              }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleNext}
            className="w-full h-14 bg-[#95C121] hover:bg-[#95C121]/90 text-white shadow-lg"
            size="lg"
          >
            {currentStep === steps.length - 1 ? (
              <>
                <Check className="w-5 h-5 mr-2" />
                Começar a usar
              </>
            ) : (
              <>
                Próximo
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>

          {currentStep < steps.length - 1 && (
            <Button
              onClick={handleSkip}
              variant="ghost"
              className="w-full text-white hover:bg-white/10"
            >
              Pular introdução
            </Button>
          )}
        </div>

        {/* Step counter */}
        <p className="text-center text-white/60 text-sm mt-6">
          {currentStep + 1} de {steps.length}
        </p>
      </div>
    </div>
  );
}
