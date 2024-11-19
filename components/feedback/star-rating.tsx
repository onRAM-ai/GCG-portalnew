"use client";

import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  readonly?: boolean;
}

export function StarRating({ value, onChange, readonly }: StarRatingProps) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => !readonly && onChange(rating)}
          className={`text-2xl ${
            readonly ? "cursor-default" : "cursor-pointer"
          } transition-colors ${
            rating <= value
              ? "text-yellow-400"
              : "text-gray-300 hover:text-yellow-200"
          }`}
          disabled={readonly}
        >
          <Star className="h-6 w-6" />
        </button>
      ))}
    </div>
  );
}