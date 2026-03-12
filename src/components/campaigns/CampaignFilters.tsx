"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Niche, SocialPlatform } from "@prisma/client";

const NICHES: { value: Niche; label: string }[] = [
  { value: "FASHION", label: "Fashion" },
  { value: "BEAUTY", label: "Beauty" },
  { value: "TECH", label: "Tech" },
  { value: "GAMING", label: "Gaming" },
  { value: "FITNESS", label: "Fitness" },
  { value: "FOOD", label: "Food" },
  { value: "TRAVEL", label: "Travel" },
  { value: "LIFESTYLE", label: "Lifestyle" },
  { value: "EDUCATION", label: "Education" },
  { value: "FINANCE", label: "Finance" },
  { value: "ENTERTAINMENT", label: "Entertainment" },
  { value: "OTHER", label: "Other" },
];

const PLATFORMS: { value: SocialPlatform; label: string }[] = [
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "TIKTOK", label: "TikTok" },
  { value: "YOUTUBE", label: "YouTube" },
  { value: "TWITTER", label: "Twitter/X" },
  { value: "LINKEDIN", label: "LinkedIn" },
];

export function CampaignFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("q") ?? "";
  const currentSort = searchParams.get("sort") ?? "newest";
  const activeNiches = (searchParams.get("niches") ?? "")
    .split(",")
    .filter(Boolean) as Niche[];
  const activePlatforms = (searchParams.get("platforms") ?? "")
    .split(",")
    .filter(Boolean) as SocialPlatform[];
  const currentBudgetMin = searchParams.get("budgetMin") ?? "";
  const currentBudgetMax = searchParams.get("budgetMax") ?? "";

  // Local state for text inputs to avoid URL update on every keystroke
  const [searchInput, setSearchInput] = useState(currentSearch);
  const [budgetMin, setBudgetMin] = useState(currentBudgetMin);
  const [budgetMax, setBudgetMax] = useState(currentBudgetMax);

  // Sync local state if URL changes externally
  useEffect(() => { setSearchInput(currentSearch); }, [currentSearch]);
  useEffect(() => { setBudgetMin(currentBudgetMin); }, [currentBudgetMin]);
  useEffect(() => { setBudgetMax(currentBudgetMax); }, [currentBudgetMax]);

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (!value) params.delete(key);
      else params.set(key, value);
    }
    params.delete("page");
    router.replace(`/campaigns?${params.toString()}`);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateParams({ q: searchInput || null });
  }

  function toggleNiche(niche: Niche) {
    const updated = activeNiches.includes(niche)
      ? activeNiches.filter((n) => n !== niche)
      : [...activeNiches, niche];
    updateParams({ niches: updated.join(",") || null });
  }

  function togglePlatform(platform: SocialPlatform) {
    const updated = activePlatforms.includes(platform)
      ? activePlatforms.filter((p) => p !== platform)
      : [...activePlatforms, platform];
    updateParams({ platforms: updated.join(",") || null });
  }

  function handleBudgetBlur() {
    updateParams({
      budgetMin: budgetMin || null,
      budgetMax: budgetMax || null,
    });
  }

  const hasActiveFilters =
    currentSearch ||
    activeNiches.length > 0 ||
    activePlatforms.length > 0 ||
    currentBudgetMin ||
    currentBudgetMax;

  function clearAll() {
    setSearchInput("");
    setBudgetMin("");
    setBudgetMax("");
    router.replace("/campaigns");
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4 mb-6">
      {/* Search + Sort row */}
      <div className="flex gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search campaigns..."
            className="pl-9 pr-4"
          />
        </form>

        <Select
          value={currentSort}
          onValueChange={(val) => updateParams({ sort: val })}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="deadline">Deadline soonest</SelectItem>
            <SelectItem value="budget">Highest budget</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="flex items-center gap-1.5 px-3 py-2 text-body-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Niches */}
      <div className="flex flex-wrap gap-1.5">
        {NICHES.map(({ value, label }) => {
          const active = activeNiches.includes(value);
          return (
            <button
              key={value}
              type="button"
              onClick={() => toggleNiche(value)}
              className={cn(
                "px-2.5 py-1 rounded-full text-caption font-medium border transition-all duration-150",
                active
                  ? "border-brand-600 bg-brand-50 text-brand-600"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Platforms + Budget row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {PLATFORMS.map(({ value, label }) => {
            const active = activePlatforms.includes(value);
            return (
              <button
                key={value}
                type="button"
                onClick={() => togglePlatform(value)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-caption font-medium border transition-all duration-150",
                  active
                    ? "border-brand-600 bg-brand-50 text-brand-600"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-caption text-gray-500 whitespace-nowrap">Budget $</span>
          <Input
            type="number"
            min="0"
            value={budgetMin}
            onChange={(e) => setBudgetMin(e.target.value)}
            onBlur={handleBudgetBlur}
            placeholder="Min"
            className="w-24"
          />
          <span className="text-caption text-gray-400">–</span>
          <Input
            type="number"
            min="0"
            value={budgetMax}
            onChange={(e) => setBudgetMax(e.target.value)}
            onBlur={handleBudgetBlur}
            placeholder="Max"
            className="w-24"
          />
        </div>
      </div>
    </div>
  );
}
