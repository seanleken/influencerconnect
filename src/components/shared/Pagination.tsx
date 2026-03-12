import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string>;
}

export function Pagination({
  currentPage,
  totalPages,
  basePath,
  searchParams = {},
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const buildUrl = (page: number) => {
    const params = new URLSearchParams({ ...searchParams, page: String(page) });
    return `${basePath}?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <Button variant="outline" size="sm" disabled={currentPage <= 1} asChild>
        <Link href={buildUrl(currentPage - 1)}>
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Link>
      </Button>
      <span className="text-body-sm text-gray-500">
        Page {currentPage} of {totalPages}
      </span>
      <Button variant="outline" size="sm" disabled={currentPage >= totalPages} asChild>
        <Link href={buildUrl(currentPage + 1)}>
          Next
          <ChevronRight className="w-4 h-4" />
        </Link>
      </Button>
    </div>
  );
}
