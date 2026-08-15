"use client";

import { IconCloud } from "./icon-cloud";

const images = [
  "/tech-icons/html.png",
  "/tech-icons/css.png",
  "/tech-icons/tailwind.png",
  "/tech-icons/java.png",
  "/tech-icons/react.png",
  "/tech-icons/next.png",
  "/tech-icons/git.png",
  "/tech-icons/github.png",
  "/tech-icons/spring.png",
  "/tech-icons/keycloak.png",
  "/tech-icons/jenkin.png",
  "/tech-icons/docker.png",
  "/tech-icons/vercel.png",
  "/tech-icons/pgsql.png",
  "/tech-icons/redis.png",
  "/tech-icons/ts.png",
  "/tech-icons/minio.png",
  "/tech-icons/grafana.png",
  "/tech-icons/loki.png",
  "/tech-icons/prometheus.png",
  "/tech-icons/github-action.png",
];

export function IconCloudDemoWithImageLogo() {
  return <IconCloud images={images} showControl={false} />;
}
