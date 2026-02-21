"use client";

import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { BRIDGE_STEPS, STEP_ORDER, getStepIndex, type BridgeStep } from "@/lib/bridge";

interface StepIndicatorProps {
  currentStep: BridgeStep;
  attestationAttempt?: number;
}

const VISIBLE_STEPS: BridgeStep[] = ["approving", "burning", "attesting", "minting", "complete"];

export function StepIndicator({ currentStep, attestationAttempt = 0 }: StepIndicatorProps) {
  const currentIndex = getStepIndex(currentStep);

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-white/10 z-0">
          <div
            className="h-full bg-gradient-to-r from-[#00B386] to-[#0066FF] transition-all duration-700"
            style={{
              width: `${Math.max(0, ((currentIndex - 1) / (VISIBLE_STEPS.length - 1)) * 100)}%`,
            }}
          />
        </div>

        {VISIBLE_STEPS.map((step) => {
          const stepIndex = getStepIndex(step);
          const isComplete = currentStep !== "error" && currentIndex > stepIndex;
          const isActive = currentStep === step;
          const isError = currentStep === "error" && isActive;
          const info = BRIDGE_STEPS[step];

          return (
            <div key={step} className="flex flex-col items-center gap-2 z-10">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                  isComplete && "bg-[#00B386] text-white",
                  isActive && !isError && "bg-[#0066FF] text-white ring-4 ring-[#0066FF]/30",
                  isError && "bg-red-500 text-white",
                  !isComplete && !isActive && "bg-white/10 text-white/40"
                )}
              >
                {isError ? (
                  <XCircle className="w-4 h-4" />
                ) : isComplete ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isActive ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </div>
              <div className="text-center">
                <p
                  className={cn(
                    "text-xs font-medium",
                    isActive ? "text-white" : isComplete ? "text-[#00B386]" : "text-white/40"
                  )}
                >
                  {info.label}
                </p>
                {isActive && step === "attesting" && attestationAttempt > 0 && (
                  <p className="text-xs text-white/40 mt-0.5">
                    ~{Math.floor((attestationAttempt * 5) / 60)}m {(attestationAttempt * 5) % 60}s
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
