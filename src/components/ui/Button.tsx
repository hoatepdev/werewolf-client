"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "yellow" | "black";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    let variantClass = "";
    if (variant === "yellow") {
      variantClass = "bg-yellow-400 text-black hover:bg-yellow-300";
    } else if (variant === "black") {
      variantClass = "bg-black text-white hover:bg-zinc-900";
    } else {
      variantClass = "bg-zinc-700 text-white hover:bg-zinc-600";
    }
    return (
      <button
        ref={ref}
        className={cn(
          "w-full py-3 rounded-xl font-bold text-lg shadow transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400/30",
          variantClass,
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
