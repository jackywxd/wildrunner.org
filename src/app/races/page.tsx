import React from "react";
import { Metadata } from "next";
import PageHeader from "@/components/page-header";
import { races as allRaces } from "#site/content";
import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Races",
};

export default function BlogPage() {
  const years = [...new Set(allRaces.map((blog) => blog.year))];
  const races = allRaces
    .filter((blog) => blog.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return (
    <>
      {years.reverse().map((year) => (
        <div key={year} className="container max-w-4xl py-6 lg:py-10">
          <PageHeader title={year} description={`Race results for ${year}`} />
          <hr className="my-8" />

          {races.filter((race) => race.year === year).length ? (
            <div className="grid gap-10 sm:grid-cols-2">
              {races
                .filter((race) => race.year === year)
                .map((race) => (
                  <article
                    key={race.slug}
                    className="group relative flex flex-col space-y-2"
                  >
                    {race.image && (
                      <Image
                        src={race.image}
                        alt={race.title}
                        width={804}
                        height={452}
                        className="border bg-muted transition-colors overflow-hidden"
                      />
                    )}

                    <h2 className="text-2xl font-extrabold text-primary">
                      {race.title}
                    </h2>
                    {race.description && (
                      <p className="text-muted-foreground">
                        {race.description}
                      </p>
                    )}

                    {race.date && (
                      <p className="text-sm text-muted-foreground">
                        {formatDate(race.date)}
                      </p>
                    )}

                    <Link href={race.slug} className="absolute inset-0">
                      <span className="sr-only">View Article</span>
                    </Link>
                  </article>
                ))}
            </div>
          ) : (
            <p>No Blogs found</p>
          )}
        </div>
      ))}
    </>
  );
}
