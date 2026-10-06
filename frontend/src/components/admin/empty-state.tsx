import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-md border border-dashed border-navy-200 bg-white px-6 py-14 text-center">
      <p className="font-semibold text-navy-800">{title}</p>
      {description && <p className="mt-2 max-w-sm text-sm text-navy-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
