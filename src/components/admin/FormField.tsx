import React from 'react';
import { Label } from '../ui/Label';

export const selectCls =
'h-9 w-full rounded-md border border-input bg-white px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-50';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: React.ReactNode;
  required?: boolean;
  counter?: {value: number;max: number;ideal?: [number, number];};
  children: React.ReactNode;
  className?: string;
}

export function FormField({ label, htmlFor, error, hint, required, counter, children, className = '' }: FormFieldProps) {
  let counterCls = 'text-muted-foreground';
  if (counter) {
    if (counter.value > counter.max) counterCls = 'text-red-600';else
    if (counter.ideal && counter.value >= counter.ideal[0] && counter.value <= counter.ideal[1]) counterCls = 'text-emerald-600';else
    if (counter.ideal && counter.value > 0) counterCls = 'text-amber-600';
  }
  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <Label htmlFor={htmlFor} className="text-sm font-medium">
          {label} {required && <span className="text-brand">*</span>}
        </Label>
        {counter && <span className={`text-xs tabular-nums ${counterCls}`}>{counter.value}/{counter.max}</span>}
      </div>
      {children}
      {error ? <p className="text-xs text-red-600">{error}</p> : hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>);

}