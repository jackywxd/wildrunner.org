import authorAvatar from "../../public/images/author/devbertskie.png";
export const siteConfig = {
  baseURL: process.env.NEXT_PUBLIC_SITE_URL,
  name: "Wild Runner",
  title: "野馬營",
  description: "一切關於跑步，馬拉松，越野的事情",
  author: "追雲逐雪",
  authorImage: authorAvatar,
  social: {
    github: "https://github.com/jackywxd",
    twitter: "https://twitter.com",
    facebook: "https://facebook.com",
  },
};

export type SiteConfig = typeof siteConfig;
