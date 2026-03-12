"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { saveCompanyProfile } from "@/actions/profile";
import { FileUpload } from "@/components/shared/FileUpload";
import type { CompanyProfile } from "@prisma/client";

const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"] as const;

interface Props {
  profile: CompanyProfile | null;
  userImage?: string | null;
}

export function CompanyProfileForm({ profile, userImage }: Props) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [image, setImage] = useState<string | null>(userImage ?? null);
  const [logo, setLogo] = useState<string | null>(profile?.logo ?? null);
  const [companyName, setCompanyName] = useState(profile?.companyName ?? "");
  const [website, setWebsite] = useState(profile?.website ?? "");
  const [industry, setIndustry] = useState(profile?.industry ?? "");
  const [description, setDescription] = useState(profile?.description ?? "");
  const [size, setSize] = useState<string>(profile?.size ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    startTransition(async () => {
      const result = await saveCompanyProfile({
        companyName: companyName.trim(),
        website: website.trim() || undefined,
        industry: industry.trim(),
        description: description.trim(),
        size: size || undefined,
        image,
        logo,
      });

      if (!result.success) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Profile saved",
        description: "Your company profile has been updated.",
      });
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar + Logo */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Profile Photo</Label>
          <FileUpload
            folder="avatar"
            accept="image/jpeg,image/png,image/webp"
            maxSizeBytes={2 * 1024 * 1024}
            currentUrl={image}
            onUpload={(url) => setImage(url || null)}
            label="Upload photo"
          />
        </div>
        <div className="space-y-2">
          <Label>Company Logo</Label>
          <FileUpload
            folder="logo"
            accept="image/jpeg,image/png,image/svg+xml,image/webp"
            maxSizeBytes={2 * 1024 * 1024}
            currentUrl={logo}
            onUpload={(url) => setLogo(url || null)}
            label="Upload logo"
          />
        </div>
      </div>

      {/* Company name */}
      <div className="space-y-1.5">
        <Label htmlFor="company-name">
          Company Name <span className="text-error-600">*</span>
        </Label>
        <Input
          id="company-name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Acme Corp"
          required
        />
      </div>

      {/* Website + Industry */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://yourcompany.com"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="industry">
            Industry <span className="text-error-600">*</span>
          </Label>
          <Input
            id="industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="e.g. Fashion, Technology, Food & Beverage"
            required
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="description">
            About Your Company <span className="text-error-600">*</span>
          </Label>
          <span className="text-caption text-gray-400">
            {description.length}/1000
          </span>
        </div>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tell influencers about your brand, your values, and the kinds of campaigns you run..."
          rows={4}
          maxLength={1000}
          className="resize-none"
          required
        />
      </div>

      {/* Company size */}
      <div className="space-y-1.5">
        <Label htmlFor="company-size">Company Size</Label>
        <Select value={size || undefined} onValueChange={setSize}>
          <SelectTrigger id="company-size" className="w-48">
            <SelectValue placeholder="Select size" />
          </SelectTrigger>
          <SelectContent>
            {COMPANY_SIZES.map((s) => (
              <SelectItem key={s} value={s}>
                {s} employees
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-2 border-t border-gray-100">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : profile ? "Save changes" : "Complete profile"}
        </Button>
      </div>
    </form>
  );
}
