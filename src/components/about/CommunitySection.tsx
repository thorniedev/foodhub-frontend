"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const EASE_SHARP = [0.16, 1, 0.3, 1] as const;

interface SocialButtonProps {
  icon: "fb" | "tg" | "gh";
  href?: string;
  index?: number;
  baseDelay?: number;
}

function SocialButton({
  icon,
  href,
  index = 0,
  baseDelay = 0,
}: SocialButtonProps) {
  const reduceMotion = useReducedMotion();

  if (!href) return null;

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open ${icon}`}
      className="size-9 rounded-full bg-white dark:bg-[#1E2E3E] text-[#1E2E3E] dark:text-white border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none shadow-sm"
      initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.6 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{
        type: "spring",
        stiffness: 460,
        damping: 17,
        delay: baseDelay + 0.62 + index * 0.08,
      }}
      whileHover={reduceMotion ? undefined : { y: -5, scale: 1.14 }}
      whileTap={reduceMotion ? undefined : { scale: 0.9 }}
    >
      {icon === "fb" && (
        <svg className="size-5 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      )}
      {icon === "tg" && (
        <svg className="size-[18px] fill-current -mr-0.5" viewBox="0 0 24 24">
          <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.119.098.152.228.166.323.014.095.032.312.018.483z" />
        </svg>
      )}
      {icon === "gh" && (
        <svg className="size-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
      )}
    </motion.a>
  );
}

/** Dark-mode-only flicker layer — quick lightning-style glow pulses, same system as MentorSection. */
function LightningGlow({ index = 0 }: { index?: number }) {
  return (
    <motion.span
      aria-hidden="true"
      className="hidden dark:block pointer-events-none absolute inset-0 m-auto size-[70%] rounded-full"
      style={{
        background:
          "radial-gradient(circle, rgba(232,108,43,0.3) 0%, rgba(85,183,103,0.22) 55%, transparent 75%)",
      }}
      animate={{
        opacity: [0.2, 0.8, 0.3, 0.85, 0.25],
        scale: [1, 1.06, 1.01, 1.08, 1],
      }}
      transition={{
        duration: 2.6,
        repeat: Infinity,
        ease: "easeInOut",
        delay: index * 0.35,
        times: [0, 0.15, 0.4, 0.55, 1],
      }}
    />
  );
}

interface MemberCardProps {
  id: string;
  name: string;
  role: string;
  roleColor: string;
  roleBg: string;
  avatar: string;
  index?: number;
  socials?: { facebook?: string; telegram?: string; github?: string };
}

function MemberCard({
  name,
  role,
  roleColor,
  roleBg,
  avatar,
  socials,
  index = 0,
}: MemberCardProps) {
  const reduceMotion = useReducedMotion();
  const cardDelay = Math.min(index * 0.075, 0.5);
  const spinDirection = index % 2 === 0 ? 360 : -360;
  const flyFrom = index % 2 === 0 ? -140 : 140; // alternate dart-in side per card

  return (
    <motion.div
      className="flex flex-col items-center gap-3"
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              x: flyFrom,
              y: 24,
              rotate: index % 2 === 0 ? -12 : 12,
              scale: 0.8,
              filter: "blur(4px)",
            }
      }
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        rotate: 0,
        scale: 1,
        filter: "blur(0px)",
      }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: EASE_SHARP, delay: cardDelay }}
    >
      <div className="relative size-[190px] sm:size-[220px] flex items-center justify-center">
        <motion.div
          className="absolute inset-0 size-full pointer-events-none"
          animate={reduceMotion ? undefined : { rotate: spinDirection }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        >
          <motion.svg
            className="size-full"
            viewBox="0 0 100 100"
            initial={
              reduceMotion ? false : { rotate: -70, scale: 1.16, opacity: 0 }
            }
            whileInView={{ rotate: 0, scale: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.05, ease: EASE_OUT, delay: cardDelay }}
          >
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke="#E86C2B"
              strokeWidth="1.8"
              strokeDasharray="6 4"
              className="dark:opacity-80"
            />
          </motion.svg>
        </motion.div>

        <LightningGlow index={index} />

        <motion.div
          className="relative size-[82%] rounded-full border-[3.5px] border-[#55B767] overflow-hidden bg-gray-100 dark:bg-gray-800"
          initial={reduceMotion ? false : { scale: 0.72, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{
            type: "spring",
            stiffness: 150,
            damping: 15,
            delay: cardDelay + 0.2,
          }}
          whileHover={reduceMotion ? undefined : { scale: 1.06 }}
        >
          <Image
            src={avatar}
            alt={name}
            fill
            unoptimized
            className="object-cover"
            sizes="(max-width: 640px) 180px, 210px"
          />
        </motion.div>

        <motion.div
          className="absolute bottom-[23%] right-[10%] size-5 sm:size-6 rounded-full bg-[#55B767] border-2 border-white dark:border-[#1E2E3E]"
          initial={reduceMotion ? false : { scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{
            type: "spring",
            stiffness: 520,
            damping: 14,
            delay: cardDelay + 0.5,
          }}
        >
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute -inset-0.5 rounded-full bg-[#55B767]"
            animate={
              reduceMotion ? undefined : { scale: [1, 2.1], opacity: [0.55, 0] }
            }
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: "easeOut",
              delay: index * 0.22,
            }}
          />
        </motion.div>
      </div>

      <div className="text-center flex flex-col items-center gap-2">
        <motion.p
          className="font-['Kantumruy_Pro',sans-serif] font-semibold text-[#1E2E3E] dark:text-white text-lg sm:text-xl"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{
            duration: 0.55,
            ease: EASE_OUT,
            delay: cardDelay + 0.4,
          }}
        >
          {name}
        </motion.p>

        {/* Role badge: inline style handles light mode; dark: classes use Tailwind's
            !important prefix so they can win over the inline style in dark mode. */}
        <motion.span
          className="font-['Kantumruy_Pro',sans-serif] text-sm font-medium px-5 py-1 rounded-full dark:!text-[#FDBA74] dark:!bg-[#E86C2B]/15"
          style={{ color: roleColor, backgroundColor: roleBg }}
          initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.85 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{
            type: "spring",
            stiffness: 380,
            damping: 18,
            delay: cardDelay + 0.52,
          }}
        >
          {role}
        </motion.span>

        <div className="flex gap-2 mt-1">
          <SocialButton
            icon="fb"
            href={socials?.facebook}
            index={0}
            baseDelay={cardDelay}
          />
          <SocialButton
            icon="tg"
            href={socials?.telegram}
            index={1}
            baseDelay={cardDelay}
          />
          <SocialButton
            icon="gh"
            href={socials?.github}
            index={2}
            baseDelay={cardDelay}
          />
        </div>
      </div>
    </motion.div>
  );
}

// Leaders (2)
const leaders: MemberCardProps[] = [
  {
    id: "l1",
    name: "ហុង វណ្ណដេត",
    role: "Leader",
    roleColor: "#1E2E3E",
    roleBg: "#FEF1E8",
    avatar: "about/lokb.jpg",
    socials: {
      facebook: "https://www.facebook.com/share/1EoHb7vjU3/?mibextid=wwXIfr",
      telegram: "https://t.me/Hongvanndeth",
      github: "https://github.com/Vanndeth-Hong",
    },
  },
  {
    id: "l2",
    name: "ង៉ូវ​ គឹមស៊ូហេង",
    role: "Sub-Leader",
    roleColor: "#1E2E3E",
    roleBg: "#FEF1E8",
    avatar: "about/souheng.jpg",
    socials: {
      facebook: "https://www.facebook.com/USERNAME",
      telegram: "https://t.me/souheng_kim",
      github: "https://github.com/ngovkimsouheng",
    },
  },
];

// Members (Exactly 8 unique people)
const members: MemberCardProps[] = [
  {
    id: "m1",
    name: "ភឿន សូលីតា",
    role: "FullStack",
    roleColor: "#1E2E3E",
    roleBg: "#FEF1E8",
    avatar: "about/lyta.jpg",
    socials: {
      facebook: "https://www.facebook.com/share/1Gro8hQqpP/?mibextid=wwXIfr",
      telegram: "https://t.me/Whalients",
      github: "https://github.com/Phoeurnsolyta",
    },
  },
  {
    id: "m2",
    name: "ហ័ង ម៉េងយៀក",
    role: "Frontend",
    roleColor: "#1E2E3E",
    roleBg: "#FEF1E8",
    avatar: "about/mingyeak.jpg",
    socials: {
      facebook: "https://www.facebook.com/share/189oyqLh4v/",
      telegram: "https://t.me/mingyeakhoung",
      github: "https://github.com/Houngmingyeak",
    },
  },
  {
    id: "m3",
    name: "សំ ករុណា",
    role: "Backend",
    roleColor: "#1E2E3E",
    roleBg: "#FEF1E8",
    avatar: "about/karona.jpg",
    socials: {
      facebook: "https://www.facebook.com/share/1GWBpCBHgw/?mibextid=wwXIfr",
      telegram: "https://t.me/USERNAME",
      github: "https://github.com/karonasam",
    },
  },
  {
    id: "m4",
    name: "គឹម ចាន់ថន",
    role: "FullStack",
    roleColor: "#1E2E3E",
    roleBg: "#FEF1E8",
    avatar: "about/thorn.jpg",
    socials: {
      facebook: "https://www.facebook.com/USERNAME",
      telegram: "https://t.me/Thornoir04",
      github: "https://github.com/thornieDev/",
    },
  },
  {
    id: "m5",
    name: "ឡេង សារ័ត្ម",
    role: "FullStack",
    roleColor: "#1E2E3E",
    roleBg: "#FEF1E8",
    avatar: "about/saroth.png",
    socials: {
      facebook: "https://www.facebook.com/share/19BBhcnDnU/?mibextid=wwXIfr",
      telegram: "https://t.me/lengsaroth",
      github: "https://github.com/it-roth",
    },
  },
  {
    id: "m6",
    name: "រឿម តារា",
    role: "FullStack",
    roleColor: "#1E2E3E",
    roleBg: "#FEF1E8",
    avatar: "about/dara.jpg",
    socials: {
      facebook: "https://www.facebook.com/USERNAME",
      telegram: "https://t.me/Roeurmdara",
      github: "https://github.com/Roeurmdara",
    },
  },
  {
    id: "m7",
    name: "លីម ឡុងហ្វ៊ូ",
    role: "FullStack",
    roleColor: "#1E2E3E",
    roleBg: "#FEF1E8",
    avatar: "about/longfou.jpg",
    socials: {
      facebook: "https://www.facebook.com/lim.longfou",
      telegram: "https://t.me/Moha_Fou",
      github: "https://github.com/Longfou1900",
    },
  },
  {
    id: "m8",
    name: "ធឿន ចន្ថាត",
    role: "FullStack",
    roleColor: "#1E2E3E",
    roleBg: "#FEF1E8",
    avatar: "about/chanthat.png",
    socials: {
      facebook: "https://www.facebook.com/USERNAME",
      telegram: "https://t.me/Chanthat_Thoeurn",
      github: "https://github.com/ChanthatThoeurn",
    },
  },
];

export default function CommunitySection() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="py-12 md:py-20 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <motion.h2
            className="font-['Kantumruy_Pro',sans-serif] font-extrabold text-3xl sm:text-4xl md:text-[48px] tracking-wide"
            initial={
              reduceMotion
                ? false
                : { opacity: 0, y: 30, letterSpacing: "0.18em" }
            }
            whileInView={{ opacity: 1, y: 0, letterSpacing: "0.025em" }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.85, ease: EASE_OUT }}
          >
            <span className="text-[#136c34] dark:text-[#4ADE80]">
              សមាជិកក្រុម{" "}
            </span>
            <span className="text-[#f97316] dark:text-[#FB923C]">របស់យើង</span>
          </motion.h2>
        </div>

        <div className="flex flex-wrap gap-8 sm:gap-12 md:gap-16 justify-center mb-12 sm:mb-16">
          {leaders.map((member, memberIndex) => (
            <MemberCard key={member.id} {...member} index={memberIndex} />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 sm:gap-10 justify-items-center">
          {members.map((member, memberIndex) => (
            <MemberCard key={member.id} {...member} index={memberIndex} />
          ))}
        </div>
      </div>
    </section>
  );
}
