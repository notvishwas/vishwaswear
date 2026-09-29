import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type ContainerSize = "page" | "narrow" | "prose";

const sizes: Record<ContainerSize, string> = {
  page: "max-w-page",
  narrow: "max-w-narrow",
  prose: "max-w-prose",
};

type ContainerProps = ComponentProps<"div"> & { size?: ContainerSize };

export function Container({ size = "page", className, ...props }: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", sizes[size], className)}
      {...props}
    />
  );
}
