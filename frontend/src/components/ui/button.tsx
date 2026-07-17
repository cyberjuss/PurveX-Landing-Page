import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "border-slate-950 bg-slate-950 text-white shadow-sm hover:-translate-y-0.5 hover:border-slate-800 hover:bg-slate-800 hover:shadow-md active:translate-y-0 dark:border-white dark:bg-white dark:text-slate-950 dark:hover:border-slate-200 dark:hover:bg-slate-100",
        destructive:
          "border-red-600 bg-red-600 text-white shadow-sm hover:-translate-y-0.5 hover:border-red-500 hover:bg-red-500 hover:shadow-md active:translate-y-0 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border-slate-200 bg-white text-slate-700 shadow-sm hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 hover:shadow-md active:translate-y-0 dark:border-slate-700 dark:bg-[#151515] dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-[#1c1c1c] dark:hover:text-white",
        secondary:
          "border-slate-200 bg-slate-100 text-slate-800 shadow-sm hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-200 hover:shadow-md active:translate-y-0 dark:border-slate-800 dark:bg-[#181818] dark:text-slate-100 dark:hover:border-slate-700 dark:hover:bg-[#202020]",
        ghost:
          "border-transparent bg-transparent text-slate-600 shadow-none hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white",
        link: "border-transparent bg-transparent px-1 text-slate-700 underline-offset-4 shadow-none hover:text-slate-950 hover:underline dark:text-slate-300 dark:hover:text-white",
        elite:
          "border-blue-200 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white shadow-[0_14px_30px_-18px_rgba(37,99,235,0.65)] hover:-translate-y-0.5 hover:from-blue-500 hover:via-blue-500 hover:to-cyan-400 hover:shadow-[0_18px_36px_-20px_rgba(37,99,235,0.72)] active:translate-y-0",
      },
      size: {
        default: "h-10 px-5 py-2 has-[>svg]:px-4",
        sm: "h-9 gap-1.5 px-4 text-xs has-[>svg]:px-3",
        lg: "h-11 px-6 text-base has-[>svg]:px-5",
        icon: "size-10 rounded-xl",
        "icon-sm": "size-9 rounded-lg",
        "icon-lg": "size-12 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
