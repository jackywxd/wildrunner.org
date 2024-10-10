import { ProgressBarProvider } from "@/components/transition/react-transition-progress";
import React from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ProgressBarProvider>{children}</ProgressBarProvider>
    </>
  );
}
