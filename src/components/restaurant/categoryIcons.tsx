import {
  PiTagBold,
  PiSunHorizonBold,
  PiCoffeeBold,
  PiLeafBold,
  PiBowlFoodBold,
  PiMartiniBold,
} from "react-icons/pi";

type CategoryIconProps = {
  icon: string;
  className?: string;
};

/** Renders the icon glyph for a given category `icon` key (stored as a
 *  plain string in the mock JSON, so the data layer stays framework
 *  agnostic and easy to swap for a real API later).
 *
 *  Written as an explicit switch — rather than `const Icon = map[icon]`
 *  followed by `<Icon />` — so every branch is a statically-known JSX
 *  element. That satisfies the `react-hooks/static-components` lint rule,
 *  which flags resolving a component reference through a variable inside
 *  a render body. */
export function CategoryIcon({ icon, className }: CategoryIconProps) {
  switch (icon) {
    case "sunrise":
      return <PiSunHorizonBold className={className} />;
    case "coffee":
      return <PiCoffeeBold className={className} />;
    case "leaf":
      return <PiLeafBold className={className} />;
    case "bowl":
      return <PiBowlFoodBold className={className} />;
    case "cup":
      return <PiMartiniBold className={className} />;
    case "tag":
    default:
      return <PiTagBold className={className} />;
  }
}
