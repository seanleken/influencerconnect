import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";

interface AvatarWithFallbackProps {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

export function AvatarWithFallback({
  src,
  name,
  size = "md",
  className,
}: AvatarWithFallbackProps) {
  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage src={src ?? undefined} alt={`${name}'s avatar`} />
      <AvatarFallback className="bg-brand-100 text-brand-600 font-semibold">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
