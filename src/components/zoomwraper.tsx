"use client";
import { useEffect, useRef } from "react";
import { ReactNode } from "react";

export default function ZoomWrapper({ children }: { children: ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = contentRef.current;
    if (!element) return;

    // Store original zoom
    const originalZoom = element.style.zoom;
    // Apply zoom only to content area
    element.style.zoom = "80%";
    
    return () => {
      // Only restore if element still exists
      if (element) {
        element.style.zoom = originalZoom;
      }
    };
  }, []);

  return (
    <div ref={contentRef} style={{ width: '100%', height: '100%' }}>
      {children}
    </div>
  );
}