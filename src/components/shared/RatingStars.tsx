import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md";
  className?: string;
}

export function RatingStars({ rating, reviewCount, size = "sm", className }: RatingStarsProps) {
  const starSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            starSize,
            star <= Math.round(rating) ? "text-warning-600 fill-warning-600" : "text-gray-200 fill-gray-200"
          )}
        />
      ))}
      {reviewCount !== undefined && (
        <span className="text-caption text-gray-500 ml-1">
          {rating.toFixed(1)} ({reviewCount})
        </span>
      )}
    </div>
  );
}
