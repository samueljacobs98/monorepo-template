import type { ReactNode } from "react";

export function ConditionalWrapper({
  condition,
  wrapper,
  children,
}: {
  condition: boolean;
  wrapper: (children: ReactNode) => ReactNode;
  children: ReactNode;
}) {
  if (condition) {
    return wrapper(children);
  }
  return children;
}
