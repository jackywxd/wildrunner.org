import path from "node:path";
import { defineCollection, defineConfig, s } from "velite";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";

import { convertImagesToWebP, setFeaturedImages } from "@/lib/veliteUtils";
import { projectRootPath, staticBasePath } from "@/base-path";

const veliteRoot = "src/content";

const computedFields = <T extends { slug: string }>(data: T) => ({
  ...data,
  year: data.slug.split("/")
    ? data.slug.split("/")[1]
    : new Date().getFullYear().toString(),
  slugAsParams: data.slug.split("/").slice(1).join("/"),
});

const globals = {
  name: "Global",
  pattern: "globals/*.json",
  single: true,
  schema: s.object({
    heroTitle: s.string().default("Welcome to my blog."),
    metadata: s.object({
      title: s
        .object({ default: s.string(), template: s.string() })
        .default({ default: "My Blog", template: "%s | My Blog" }),
      description: s.string().default("Welcome to my blog."),
      authors: s
        .array(s.object({ name: s.string(), url: s.string().url().optional() }))
        .default([]),
      keywords: s.array(s.string()).default([]),
      openGraph: s
        .object({
          title: s
            .object({ default: s.string(), template: s.string() })
            .default({ default: "My Blog", template: "%s | My Blog" }),
          description: s.string().default("Welcome to my blog."),
          url: s.string().optional(),
          siteName: s.string().default("My Blog"),
          images: s
            .array(
              s.object({
                url: s.string().url(), // Must be an absolute URL
                width: s.number(),
                height: s.number(),
                alt: s.string().optional(),
              })
            )
            .optional(),
          locale: s.string().optional(),
          type: s.string().optional(),
        })
        .default({}),
    }),
    social: s
      .object({
        github: s.string(),
      })
      .optional(),
    topNavItems: s.array(
      s.object({ label: s.string(), href: s.string(), icon: s.string() })
    ),
  }),
};

const races = defineCollection({
  name: "Races",
  pattern: "races/**/*.mdx",
  schema: s
    .object({
      slug: s.path(),
      title: s.string().max(99),
      description: s.string().max(999),
      date: s.isodate(),
      published: s.boolean().default(false),
      image: s.image().optional(),
      author: s.string(),
      body: s.mdx(),
    })
    .transform(computedFields),
});

const galleries = defineCollection({
  name: "Gallery",
  pattern: "gallery/**/*.mdx",
  schema: s
    .object({
      name: s.string(),
      slug: s.slug("gallery"),
      cover: s.image().optional(),
      created: s.isodate().optional(),
      updated: s.isodate().optional(),
      location: s.string().optional(),
      featured: s.array(s.string()).default([]),
      path: s.path(),
    })
    .transform(async (data) => ({
      ...data,
      permalink: `/gallery/${data.slug}`,
      images: setFeaturedImages(
        data.featured,
        await convertImagesToWebP(
          path.join(projectRootPath, veliteRoot, data.path),
          path.join(staticBasePath, "gallery")
        )
      ),
    })),
});

const posts = defineCollection({
  name: "Post", // collection type name
  pattern: "posts/**/*.mdx", // content files glob pattern
  schema: s
    .object({
      title: s.string(), // Zod primitive type
      slug: s.slug("posts"), // validate format, unique in posts collection
      created: s.isodate().optional(), // input Date-like string, output ISO Date string.
      updated: s.isodate().optional(),
      draft: s.boolean().default(false),
      featured: s.boolean().default(false),
      cover: s.image().optional(), // input image relative path, output image object with blurImage.
      excerpt: s.string().default(""),
      seoDescription: s.string().default(""),
      author: s.string().default(""),
      columns: s.array(s.string()).default([]),
      categories: s.array(s.string()).default([]),
      tags: s.array(s.string()).default([]),
      content: s.mdx(),
      raw: s.raw(),
      path: s.path(),
      toc: s.toc(), // table of contents of markdown content
      metadata: s.metadata(), // extract markdown reading-time, word-count, etc.
    })
    .transform(async (data) => ({
      ...data,
      permalink: `/post/${data.slug}`,
      images: {},
    })),
});

const authors = defineCollection({
  name: "Author",
  pattern: "authors/**/*.md",
  schema: s
    .object({
      name: s.string(),
      slug: s.slug("authors"),
      bio: s.mdx(),
      avatar: s.image().optional(),
      social: s
        .object({
          github: s.string(),
        })
        .optional(),
    })
    .transform((data) => ({ ...data, permalink: `/author/${data.slug}` })),
});

export default defineConfig({
  root: veliteRoot,
  // output: {
  //   data: ".velite",
  //   assets: "public/static",
  //   base: "/static/",
  //   name: "[name]-[hash:6].[ext]",
  //   clean: true,
  // },
  collections: { races, posts, galleries, authors, globals },
  mdx: {
    rehypePlugins: [
      rehypeSlug as any,
      [rehypePrettyCode, { theme: "dracula" }],
      [
        rehypeAutolinkHeadings,
        {
          behavior: "wrap",
          properties: {
            className: ["subheading-anchor"],
            ariaLabel: "Link to section",
          },
        },
      ],
    ],
  },
});
