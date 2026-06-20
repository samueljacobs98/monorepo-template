import type { ReactNode } from "react";

export function Flag({
  show,
  children,
}: {
  show: boolean;
  children: ReactNode;
}) {
  if (!show) {
    return null;
  }
  return children;
}
