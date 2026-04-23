import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-display uppercase tracking-[0.18em] text-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-gold-shine text-primary-foreground shadow-gold hover:shadow-[0_0_60px_-8px_hsl(45_90%_60%/0.8)] hover:-translate-y-0.5",
        hero:
          "bg-gradient-gold-shine text-primary-foreground shadow-gold border border-primary/40 hover:-translate-y-0.5 hover:shadow-[0_0_80px_-10px_hsl(45_90%_60%/0.9)] before:absolute before:inset-0 before:rounded-[inherit] before:bg-[linear-gradient(110deg,transparent_30%,hsl(45_100%_85%/0.4)_50%,transparent_70%)] before:bg-[length:200%_100%] hover:before:animate-shimmer overflow-hidden",
        arcane:
          "bg-gradient-arcane text-secondary-foreground shadow-arcane hover:-translate-y-0.5",
        outline:
          "border border-primary/50 bg-transparent text-primary hover:bg-primary/10 hover:border-primary hover:shadow-gold",
        ghost:
          "text-foreground/80 hover:text-primary hover:bg-primary/10",
        rune:
          "border border-border-bright/40 bg-surface-raised/60 backdrop-blur-sm text-foreground hover:border-primary hover:text-primary hover:shadow-gold",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        link: "text-primary underline-offset-4 hover:underline normal-case tracking-normal",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-14 px-10 text-base",
        xl: "h-16 px-14 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
