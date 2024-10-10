import authorAvatar from "../../public/images/author/devbertskie.png";
export const siteConfig = {
  name: "Wild Runner",
  description: "一切關於跑步，越野的事情",
  author: "追雲逐雪",
  authorImage: authorAvatar,
  social: {
    github: "https://github.com/jackywxd",
    twitter: "https://twitter.com",
    facebook: "https://facebook.com",
  },
};

export type SiteConfig = typeof siteConfig;
