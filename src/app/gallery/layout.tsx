import React from "react";
import { Metadata } from "next";
import { globals } from "#site/content";

export function generateMetadata(): Metadata {
  return {
    title: `相册`,
    description: `探索摄影作品。| ${globals.metadata.description}`,
    openGraph: {
      title: `相册`,
      description: `探索摄影作品。| ${globals.metadata.description}`,
    },
  };
}

const Layout: React.FC<{
  children: React.ReactNode;
  params: { slug: string };
}> = ({ children }) => {
  return (
    <div className="container relative max-w-7xl py-6 lg:py-10">{children}</div>
  );
};

export default Layout;
