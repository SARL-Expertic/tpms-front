"use client";

import { useEffect } from "react";
import { ReactNode } from "react";

export default function ZoomWrapper({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.body.style.zoom = "80%";
  }, []);

  return <>{children}</>;
}
