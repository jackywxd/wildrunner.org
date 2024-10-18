import React from "react";
import PageHeader from "@/components/page-header";
import { races as allRaces } from "#site/content";
import { siteConfig } from "@/config/site";
import Races from "@/components/races";

export function generateMetadata() {
  const baseURL = siteConfig.baseURL;
  const title = `比賽 | Races | ${siteConfig.title}`;
  const description = siteConfig.description;
  const ogImage = `${baseURL}/og?title=${encodeURIComponent(title)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `${baseURL}/races`,
      images: [
        {
          url: ogImage,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default function BlogPage() {
  const years = [...new Set(allRaces.map((blog) => blog.year))].sort(
    (a, b) => +b - +a
  );
  const races = allRaces.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  return (
    <>
      {years.map((year) => (
        <div key={year} className="container max-w-4xl py-6 lg:py-10">
          <PageHeader title={year} description={`Races for ${year}`} />
          <hr className="my-8" />

          {races.filter((race) => race.year === year).length ? (
            <section>
              <Races allRaces={races.filter((race) => race.year === year)} />
            </section>
          ) : (
            <p>No Race found</p>
          )}
        </div>
      ))}
    </>
  );
}
