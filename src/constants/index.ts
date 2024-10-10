import { Icons } from "@/components/icons";
import { siteConfig } from "@/config/site";
import { Bot, Rss, Image } from "lucide-react";

export const NAV_LIST = [
  { label: "Races", path: "/races", icon: Rss },
  { label: "Gallery", path: "/gallery", icon: Image },
  { label: "About", path: "/about", icon: Bot },
];

export const SOCIALS = [
  { label: "Github", path: siteConfig.social.github, icon: Icons.github },
  { label: "Facebook", path: siteConfig.social.facebook, icon: Icons.facebook },
  { label: "Twitter", path: siteConfig.social.twitter, icon: Icons.x },
];
