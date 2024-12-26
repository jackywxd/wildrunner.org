import path from "node:path";
import { defineCollection, defineConfig, Image, s } from "velite";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import fs from "fs/promises";

import {
  convertImagesToWebP,
  convertToWebP,
  setFeaturedImages,
} from "@/lib/veliteUtils";
import { projectRootPath, staticBasePath } from "@/base-path";

const veliteRoot = "src/content";
const processImages = () => async (tree: any, file: any) => {
  const traverse = async (node: any) => {
    if (node.type === "element" && node.properties?.src) {
      const src = node.properties.src;
      if (!src.startsWith("http")) {
        try {
          const filename = path.basename(src.replace("/static/", ""));
          const postDir = path.dirname(file.path);
          const inputPath = path.join(postDir);

          const slugParts = postDir.split(path.sep);
          const slug = `${slugParts.slice(-3).join("/")}`;

          console.log("Processing image:", {
            filename,
            inputPath,
            slug,
          });

          const image = await convertToWebP(inputPath, slug, filename);

          // 创建新的属性对象，保留原有属性
          const newProperties = {
            ...node.properties,
            src: image.src,
            width: image.width,
            height: image.height,
            blurdataurl: image.blurDataURL,
            loading: "lazy",
            placeholder: "blur",
          };

          // 替换原有属性
          node.properties = newProperties;
        } catch (error) {
          console.error(`Failed to process image: ${src}`, error);
        }
      }
    }

    if (node.children) {
      await Promise.all(node.children.map(traverse));
    }
  };

  await traverse(tree);
};
const computedFields = async <
  T extends { slug: string; title: string; image?: Image },
  K extends { meta: { data: any } },
>(
  data: T,
  { meta }: K
) => {
  // console.log("computedFields", data);
  // console.log("computedFields meta", meta.data.data.image);
  const file = meta.data.data.image;
  const inputPath = path.join(projectRootPath, veliteRoot, data.slug);

  // const outputPath = path.join(staticBasePath, "images", data.slug);

  // covert images to webp
  // await fs
  //   .mkdir(outputPath, { recursive: true })
  //   .then(() => console.log(`Directory '${outputPath}' created.`))
  //   .catch((err) => console.error(`Error creating directory: ${err.message}`));

  const image = await convertToWebP(inputPath, data.slug, file);

  if (image) {
    // console.log("computedFields image", image);
    // replace the image in data to the new webp image
    data.image = image;
  }

  return {
    ...data,
    year: data.slug.split("/")
      ? data.slug.split("/")[1]
      : new Date().getFullYear().toString(),
    slugAsParams: data.slug.split("/").slice(1).join("/"),
  };
};

const globals = {
  name: "Global",
  pattern: "globals/*.json",
  single: true,
  schema: s.object({
    heroTitle: s.string().default("歡迎來到野馬營."),
    metadata: s.object({
      title: s
        .object({ default: s.string(), template: s.string() })
        .default({ default: "野馬營", template: "%s | 野馬營" }),
      description: s.string().default("Welcome to 野馬營."),
      authors: s
        .array(s.object({ name: s.string(), url: s.string().url().optional() }))
        .default([]),
      keywords: s.array(s.string()).default([]),
      openGraph: s
        .object({
          title: s
            .object({ default: s.string(), template: s.string() })
            .default({ default: "野馬營", template: "%s | 野馬營" }),
          description: s.string().default("Welcome to 野馬營."),
          url: s.string().optional(),
          siteName: s.string().default("野馬營"),
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
      body: s.mdx({
        rehypePlugins: [processImages],
      }),
    })
    .transform(computedFields),
});

const galleries = defineCollection({
  name: "Gallery",
  pattern: "gallery/**/*.mdx",
  schema: s
    .object({
      name: s.string(),
      slug: s.slug("gallery"), // this is path for the gallery, not the slug
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
          path.join(data.path)
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
      slug: s.path(),
      created: s.isodate().optional(), // input Date-like string, output ISO Date string.
      updated: s.isodate().optional(),
      featured: s.boolean().default(false),
      cover: s.image().optional(), // input image relative path, output image object with blurImage.
      excerpt: s.string().default(""),
      seoDescription: s.string().default(""),
      author: s.string().default(""),
      columns: s.array(s.string()).default([]),
      categories: s.array(s.string()).default([]),
      tags: s.array(s.string()).default([]),
      body: s.mdx({
        rehypePlugins: [processImages],
      }),
      raw: s.raw(),
      path: s.path(),
      toc: s.toc(), // table of contents of markdown content
      date: s.isodate().default(() => new Date().toISOString()),
      published: s.boolean().default(false),
      image: s.image().optional(),
      description: s.string().max(999),
      metadata: s.metadata(), // extract markdown reading-time, word-count, etc.
    })
    .transform(async (data, meta) => {
      // 首先处理主图片（如果存在）
      const transformedData = await computedFields(data, meta);
      return {
        ...transformedData,
        images: await convertImagesToWebP(
          path.join(projectRootPath, veliteRoot, data.path),
          path.join(data.path)
        ),
      };
    }),
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
  output: {
    data: ".velite",
    assets: "public/static",
    name: "[name].[ext]",
    clean: true,
  },
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
