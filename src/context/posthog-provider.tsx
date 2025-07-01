// app/providers.js
"use client";
import React, { ReactNode, useEffect, useState } from "react";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

function initPostHog() {
  if (typeof window !== "undefined" && !posthog.__loaded) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      person_profiles: "identified_only", // or 'always' to create profiles for anonymous users as well
    });
  }
}

export function PHProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initPostHog();
    setIsInitialized(true);
  }, []);

  if (!isInitialized) {
    return <>{children}</>;
  }

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
