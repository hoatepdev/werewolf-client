"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(e.target.checked);
    };

    return (
      <div className="relative">
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          onChange={handleChange}
          className={cn(
            "peer h-4 w-4 shrink-0 rounded-sm border border-zinc-700 bg-zinc-800 ring-offset-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 checked:bg-yellow-400 checked:text-zinc-900 appearance-none",
            className
          )}
          {...props}
        />
        {checked && (
          <Check className="absolute top-0 left-0 h-4 w-4 text-zinc-900 pointer-events-none" />
        )}
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
