"use client";

import * as React from "react";

import { ThemeProvider } from "./theme-provider";
import { I18nProvider } from "./i18n-provider";
import { SWRProvider } from "./swr-provider";
import { PHProvider } from "./posthog-provider";
import dynamic from "next/dynamic";

const providers = [PHProvider, I18nProvider, SWRProvider, ThemeProvider];
const PostHogPageView = dynamic(() => import("@/components/PostHogPageView"), {
  ssr: false,
});

interface AppContextProps {
  children: React.ReactNode;
  providers: Array<React.JSXElementConstructor<React.PropsWithChildren<any>>>;
}

const AppContext = (props: AppContextProps) => {
  const { children, providers = [] } = props;

  return (
    <React.Fragment>
      {providers.reduceRight(
        (child, Provider) => (
          <Provider>{child}</Provider>
        ),
        children
      )}
    </React.Fragment>
  );
};

interface AppProviderProps {
  children: React.ReactNode;
}

const AppProvider = (props: AppProviderProps) => {
  const { children } = props;

  return (
    <AppContext providers={providers}>
      {children}
      <PostHogPageView />
    </AppContext>
  );
};

export { AppProvider, type AppProviderProps };
