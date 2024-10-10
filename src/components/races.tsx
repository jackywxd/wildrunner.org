import React from "react";
import { races } from "#site/content";
import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Pencil } from "lucide-react"; // Example from lucide-react

export default function Races({ allRaces }: { allRaces: typeof races }) {
  const rs = allRaces.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  return (
    <div className="container max-w-4xl py-6 lg:py-10">
      {rs.length ? (
        <div className="grid gap-10 sm:grid-cols-2">
          {rs.map((race) => (
            <article
              key={race.slug}
              className="group relative flex flex-col space-y-2"
            >
              {!race.published ? (
                <span className="absolute inset-0 flex items-center justify-center bg-gray-300 opacity-50">
                  <Pencil size={80} className="text-gray-800" />
                  <span className="sr-only">Under Construction</span>
                </span>
              ) : (
                <Link href={race.slug} className="absolute inset-0">
                  <span className="sr-only">View Article</span>
                </Link>
              )}
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
                <p className="text-muted-foreground">{race.description}</p>
              )}
              {race.date && (
                <p className="text-sm text-muted-foreground">
                  {formatDate(race.date)}
                </p>
              )}
            </article>
          ))}
        </div>
      ) : (
        <p>No Blogs found</p>
      )}
    </div>
  );
}
