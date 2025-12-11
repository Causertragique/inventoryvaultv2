import * as React from "react";
import * as tooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

const tooltipProvider = tooltipPrimitive.Provider;

const tooltip = tooltipPrimitive.Root;

const tooltipTrigger = tooltipPrimitive.Trigger;

const tooltipContent = React.forwardRef<
  React.ElementRef<typeof tooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof tooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <tooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className,
    )}
    {...props}
  />
));
tooltipContent.displayName = tooltipPrimitive.Content.displayName;

export { tooltip, tooltipTrigger, tooltipContent, tooltipProvider };
