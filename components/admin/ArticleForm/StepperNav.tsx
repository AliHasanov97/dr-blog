import { Icon } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface StepDescriptor {
  key: string;
  label: string;
  icon: string;
}

export interface StepperNavProps {
  steps: StepDescriptor[];
  step: number;
  stepErrors: string[];
  onGoToStep: (index: number) => void;
}

export function StepperNav({ steps, step, stepErrors, onGoToStep }: StepperNavProps) {
  return (
    <div className="lg:w-56 shrink-0">
      <nav className="lg:sticky lg:top-36">
        {/* Mobil: üfüqi */}
        <div className="flex lg:hidden items-center justify-center gap-space-lg mb-space-md">
          {steps.map((s, i) => {
            const isComplete = i < step;
            const isCurrent = i === step;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => onGoToStep(i)}
                className="flex flex-col items-center gap-space-xs active:scale-95 transition-transform"
              >
                <span
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center font-label text-title-md transition-colors",
                    isCurrent
                      ? "bg-secondary text-on-secondary"
                      : isComplete
                        ? "bg-secondary/20 text-secondary"
                        : "bg-surface-container text-outline",
                  )}
                >
                  {isComplete ? <Icon name="check" size={22} /> : i + 1}
                </span>
                <span className={cn(
                  "font-label text-label-md",
                  isCurrent ? "text-secondary" : "text-outline"
                )}>
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Desktop: şaquli */}
        <div className="hidden lg:block">
          {steps.map((s, i) => {
            const isComplete = i < step;
            const isCurrent = i === step;
            const isLast = i === steps.length - 1;

            return (
              <div key={s.key} className="relative">
                {/* Birləşdirici xətt */}
                {!isLast && (
                  <div
                    className={cn(
                      "absolute left-5 top-12 w-0.5 h-8",
                      i < step ? "bg-secondary/40" : "bg-outline-variant/30",
                    )}
                  />
                )}

                <button
                  type="button"
                  onClick={() => onGoToStep(i)}
                  className="relative w-full flex items-center gap-space-md py-space-sm text-start group"
                >
                  {/* Dairə */}
                  <span
                    className={cn(
                      "relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all",
                      isCurrent
                        ? "bg-secondary text-on-secondary"
                        : isComplete
                          ? "bg-secondary/20 text-secondary"
                          : "bg-surface-container text-outline group-hover:bg-surface-container-high",
                    )}
                  >
                    {isComplete ? (
                      <Icon name="check" size={20} />
                    ) : (
                      <span className="font-label text-title-md">{i + 1}</span>
                    )}
                  </span>

                  {/* Mətn */}
                  <span
                    className={cn(
                      "font-label text-title-sm transition-colors",
                      isCurrent
                        ? "text-secondary"
                        : isComplete
                          ? "text-on-surface"
                          : "text-outline group-hover:text-on-surface-variant",
                    )}
                  >
                    {s.label}
                  </span>
                </button>
              </div>
            );
          })}

          {/* Xəta mesajı */}
          {stepErrors.length > 0 && (
            <p className="mt-space-sm text-body-md text-error flex items-center gap-1">
              <Icon name="error" size={16} />
              {stepErrors[0]}
            </p>
          )}
        </div>
      </nav>
    </div>
  );
}
