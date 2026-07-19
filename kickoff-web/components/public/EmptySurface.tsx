import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptySurface({
  icon: Icon,
  title,
  text,
  light = false,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
  light?: boolean;
}) {
  return (
    <div className={cn("rounded-md border border-dashed p-6 text-center", light ? "border-[#102018]/18 bg-white text-[#102018]" : "border-white/12 bg-white/[0.04] text-white")}>
      <Icon className={cn("mx-auto mb-3 h-8 w-8", light ? "text-[#2a7b4f]/55" : "text-white/32")} />
      <h3 className="font-black">{title}</h3>
      <p className={cn("mt-2 text-sm leading-6", light ? "text-[#526357]" : "text-white/48")}>{text}</p>
    </div>
  );
}
