import { IconCloud } from "./ui/icon-cloud";

const slugs = [
  "typescript",
  "javascript",
  "java",
  "react",
  "html5",
  "css3",
  "postgresql",
  "firebase",
  "vercel",
  "docker",
  "git",
  "github",
  "visualstudiocode",
  "intellijidea",
  "figma",
];

export function IconCloudDemo() {
  const images = slugs.map(
    (slug) => `https://cdn.simpleicons.org/${slug}/${slug}`,
  );

  return (
    <div className="relative flex size[500px] items-center justify-center overflow-hidden">
      <IconCloud images={images} />
    </div>
  );
}
