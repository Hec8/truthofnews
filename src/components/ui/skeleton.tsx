import * as React from "react";
import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-[#e2e8f0] dark:bg-[#334155]",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
