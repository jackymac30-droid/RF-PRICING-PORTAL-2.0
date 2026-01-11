import { CheckCircle, Circle, Clock, Send, Award, Users, CheckCircle2 } from 'lucide-react';
import type { Week } from '../types';

interface WorkflowStepsProps {
  week: Week | null;
  quotes: any[];
  hasAllocations: boolean;
  allocationsSent: boolean;
  suppliersResponded: boolean;
  loopClosed: boolean;
}

export function WorkflowSteps({ week, quotes, hasAllocations, allocationsSent, suppliersResponded, loopClosed }: WorkflowStepsProps) {
  if (!week) return null;

  const hasPricing = quotes.some(q => q.supplier_fob !== null);
  const hasFinalized = quotes.some(q => q.rf_final_fob !== null);
  const isFinalized = week.status === 'finalized' || week.status === 'closed';

  const steps = [
    {
      id: 1,
      name: 'Suppliers Submit Pricing',
      completed: hasPricing,
      current: !hasPricing,
      icon: Users
    },
    {
      id: 2,
      name: 'RF Finalizes Pricing',
      completed: isFinalized && hasFinalized,
      current: hasPricing && !isFinalized,
      icon: CheckCircle
    },
    {
      id: 3,
      name: 'RF Allocates Volumes',
      completed: hasAllocations,
      current: isFinalized && !hasAllocations,
      icon: Award
    },
    {
      id: 4,
      name: 'Send to Suppliers',
      completed: allocationsSent,
      current: hasAllocations && !allocationsSent,
      icon: Send
    },
    {
      id: 5,
      name: 'Suppliers Respond',
      completed: suppliersResponded,
      current: allocationsSent && !suppliersResponded,
      icon: Users
    },
    {
      id: 6,
      name: 'Volume Loop Closed',
      completed: loopClosed,
      current: suppliersResponded && !loopClosed,
      icon: CheckCircle2
    }
  ];

  const completedCount = steps.filter(s => s.completed).length;
  const progress = (completedCount / steps.length) * 100;

  return (
    <div className="bg-gradient-to-r from-slate-900/95 via-emerald-900/95 to-slate-900/95 backdrop-blur-xl rounded-2xl border-2 border-emerald-400/40 shadow-2xl shadow-emerald-500/10 p-6 mb-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent animate-pulse"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-black text-white mb-1 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              Workflow Progress
            </h3>
            <p className="text-sm text-emerald-200/90 font-semibold">
              Currently on Step {completedCount + 1} of {steps.length} • {Math.round(progress)}% Complete
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-4 w-40 bg-white/10 rounded-full overflow-hidden border-2 border-white/20 shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 transition-all duration-700 shadow-lg shadow-emerald-500/50"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-lg font-black text-white min-w-[3rem]">{Math.round(progress)}%</span>
          </div>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            
            return (
              <div
                key={step.id}
                className={`relative flex flex-col items-center p-5 rounded-xl border-2 transition-all duration-300 transform ${
                  step.completed
                    ? 'bg-gradient-to-br from-emerald-500/30 to-green-600/20 border-emerald-400/60 shadow-xl shadow-emerald-500/30 scale-105'
                    : step.current
                    ? 'bg-gradient-to-br from-blue-500/30 to-cyan-600/20 border-blue-400/60 shadow-xl shadow-blue-500/30 scale-105 animate-pulse ring-2 ring-blue-400/50'
                    : 'bg-white/5 border-white/10 opacity-40 hover:opacity-60'
                }`}
              >
                {step.completed ? (
                  <div className="relative mb-3">
                    <CheckCircle className="w-8 h-8 text-emerald-300 drop-shadow-lg" strokeWidth={2.5} />
                    <div className="absolute inset-0 w-8 h-8 bg-emerald-400/20 rounded-full animate-ping"></div>
                  </div>
                ) : step.current ? (
                  <div className="relative mb-3">
                    <Clock className="w-8 h-8 text-blue-300 drop-shadow-lg animate-spin" strokeWidth={2.5} />
                    <div className="absolute inset-0 w-8 h-8 bg-blue-400/20 rounded-full animate-pulse"></div>
                  </div>
                ) : (
                  <Circle className="w-8 h-8 text-white/30 mb-3" strokeWidth={2} />
                )}
                <span className={`text-xs font-black text-center leading-tight uppercase tracking-wider ${
                  step.completed ? 'text-emerald-200' : step.current ? 'text-blue-200' : 'text-white/40'
                }`}>
                  {step.name}
                </span>
                {idx < steps.length - 1 && (
                  <div className={`absolute top-1/2 -right-4 w-8 h-1 rounded-full ${
                    step.completed ? 'bg-gradient-to-r from-emerald-400 to-green-500' : 'bg-white/20'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
