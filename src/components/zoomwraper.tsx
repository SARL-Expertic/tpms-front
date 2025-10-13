"use client";

import { useEffect } from "react";
import { ReactNode } from "react";

export default function ZoomWrapper({ children }: { children: ReactNode }) {
  useEffect(() => {
    const previousZoom = document.body.style.zoom;
    document.body.style.zoom = "100%";

    return () => {
      document.body.style.zoom = previousZoom;
    };
  }, []);

  return <>{children}</>;
}
