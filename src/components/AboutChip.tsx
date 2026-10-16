import type { ReactNode } from "react";

export default function AbotChip({children}: {children: ReactNode}) {
  return <span className="skill-chip">{children}</span>;
}
