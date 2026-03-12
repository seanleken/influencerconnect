import { cn } from "@/lib/utils";
import type {
  CampaignStatus,
  ApplicationStatus,
  ContentStatus,
  PaymentStatus,
} from "@prisma/client";

type Status = CampaignStatus | ApplicationStatus | ContentStatus | PaymentStatus | string;

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  // Campaign
  DRAFT: { label: "Draft", className: "bg-warning-100 text-warning-600" },
  OPEN: { label: "Open", className: "bg-success-100 text-success-600" },
  IN_PROGRESS: { label: "In Progress", className: "bg-info-100 text-info-600" },
  COMPLETED: { label: "Completed", className: "bg-success-100 text-success-600" },
  CANCELLED: { label: "Cancelled", className: "bg-error-100 text-error-600" },
  // Application
  PENDING: { label: "Pending", className: "bg-warning-100 text-warning-600" },
  ACCEPTED: { label: "Accepted", className: "bg-success-100 text-success-600" },
  REJECTED: { label: "Rejected", className: "bg-error-100 text-error-600" },
  WITHDRAWN: { label: "Withdrawn", className: "bg-gray-100 text-gray-600" },
  // Content
  SUBMITTED: { label: "Submitted", className: "bg-info-100 text-info-600" },
  REVISION_REQUESTED: { label: "Revision Requested", className: "bg-warning-100 text-warning-600" },
  APPROVED: { label: "Approved", className: "bg-success-100 text-success-600" },
  // Payment
  ESCROWED: { label: "Escrowed", className: "bg-info-100 text-info-600" },
  RELEASED: { label: "Released", className: "bg-success-100 text-success-600" },
  REFUNDED: { label: "Refunded", className: "bg-gray-100 text-gray-600" },
  FAILED: { label: "Failed", className: "bg-error-100 text-error-600" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, className: "bg-gray-100 text-gray-600" };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-caption font-medium",
        config.className,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  );
}
