"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { submitApplication } from "@/actions/applications";

interface Props {
  campaignId: string;
}

export function ApplicationForm({ campaignId }: Props) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [proposedRate, setProposedRate] = useState("");

  function handleSubmit() {
    startTransition(async () => {
      const result = await submitApplication({
        campaignId,
        coverLetter,
        proposedRate: proposedRate ? parseInt(proposedRate) : 0,
      });

      if (!result.success) {
        toast({ title: "Error", description: result.error, variant: "destructive" });
        return;
      }

      setSubmitted(true);
      toast({ title: "Application submitted!", description: "The company will review your application." });
    });
  }

  if (submitted) {
    return (
      <div className="bg-success-100 border border-success-600/20 rounded-xl p-5 text-center">
        <p className="text-body-sm font-medium text-success-600">Application submitted!</p>
        <p className="text-caption text-gray-600 mt-1">The company will review your application.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <h3 className="text-h4 font-heading text-gray-950">Apply to this campaign</h3>

      <div className="space-y-1.5">
        <Label htmlFor="cover-letter">
          Cover Letter <span className="text-error-600">*</span>
        </Label>
        <Textarea
          id="cover-letter"
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          placeholder="Introduce yourself, explain why you're a great fit, and describe how you'd approach this campaign..."
          rows={5}
          className="resize-none"
        />
        <p className="text-caption text-gray-400">{coverLetter.length}/2000 · minimum 50 characters</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="proposed-rate">
          Proposed Rate (USD) <span className="text-error-600">*</span>
        </Label>
        <div className="relative max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-body-sm pointer-events-none">$</span>
          <Input
            id="proposed-rate"
            type="number"
            min="1"
            value={proposedRate}
            onChange={(e) => setProposedRate(e.target.value)}
            placeholder="500"
            className="pl-6"
          />
        </div>
        <p className="text-caption text-gray-400">Your total fee for all deliverables</p>
      </div>

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={isPending}
        className="w-full"
      >
        {isPending ? "Submitting…" : "Submit Application"}
      </Button>
    </div>
  );
}
