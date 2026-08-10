"use client";

import Image from "next/image";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

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
      className="
        flex size-9 items-center justify-center
        rounded-full
        border border-gray-300
        bg-white
        text-[#1E2E3E]
        shadow-sm
        transition-colors
        hover:bg-gray-50
        focus:outline-none
        dark:border-gray-600
        dark:bg-[#1E2E3E]
        dark:text-white
        dark:hover:bg-gray-700
      "
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              y: 8,
              scale: 0.92,
            }
      }
      whileInView={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      viewport={{
        once: true,
        amount: 0.4,
      }}
      transition={{
        duration: 0.3,
        ease: EASE_OUT,
        delay: baseDelay + 0.35 + index * 0.05,
      }}
      whileHover={
        reduceMotion
          ? undefined
          : {
              y: -3,
              scale: 1.06,
              transition: {
                duration: 0.18,
              },
            }
      }
      whileTap={
        reduceMotion
          ? undefined
          : {
              scale: 0.95,
            }
      }
    >
      {icon === "fb" && (
        <svg className="size-5 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      )}

      {icon === "tg" && (
        <svg className="size-[18px] -mr-0.5 fill-current" viewBox="0 0 24 24">
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

/* =========================================================
   LIGHTNING GLOW

   This component is NOT rendered until the avatar image
   has finished loading.

   I also made the animation slower and smaller to reduce
   GPU work when many cards are visible.
========================================================= */

function LightningGlow({ index = 0 }: { index?: number }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute inset-0 m-auto
          hidden size-[92%]
          rounded-full
          dark:block
        "
        style={{
          background:
            "radial-gradient(circle, rgba(232,108,43,0.22) 0%, rgba(85,183,103,0.16) 55%, transparent 75%)",
        }}
      />
    );
  }

  return (
    <motion.span
      aria-hidden="true"
      className="
        pointer-events-none
        absolute inset-0 m-auto
        hidden size-[92%]
        rounded-full
        dark:block
      "
      style={{
        background:
          "radial-gradient(circle, rgba(232,108,43,0.28) 0%, rgba(85,183,103,0.20) 52%, transparent 74%)",

        willChange: "transform, opacity",
      }}
      initial={{
        opacity: 0,
        scale: 0.96,
      }}
      animate={{
        opacity: [0.2, 0.5, 0.25],
        scale: [1, 1.035, 1],
      }}
      transition={{
        duration: 4.5,
        repeat: Infinity,
        ease: "easeInOut",

        /*
         * Different glow starting times.
         * Prevents all 10 glows from updating identically.
         */
        delay: index * 0.18,
      }}
    />
  );
}

/* =========================================================
   MEMBER TYPE
========================================================= */

interface MemberCardProps {
  id: string;
  name: string;
  role: string;
  roleColor: string;
  roleBg: string;
  avatar: string;
  index?: number;

  socials?: {
    facebook?: string;
    telegram?: string;
    github?: string;
  };
}

/* =========================================================
   MEMBER CARD
========================================================= */

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

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  /*
   * Small stagger.
   *
   * index 0 -> 0s
   * index 1 -> 0.07s
   * index 2 -> 0.14s
   * ...
   *
   * We cap it so later cards don't wait too long.
   */
  const cardDelay = Math.min(index * 0.07, 0.42);

  return (
    <motion.article
      className="
        flex w-full max-w-[270px]
        flex-col items-center
        gap-3
      "
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              y: 22,
              scale: 0.97,
            }
      }
      whileInView={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      viewport={{
        once: true,
        amount: 0.2,
      }}
      transition={{
        duration: 0.5,
        ease: EASE_OUT,
        delay: cardDelay,
      }}
    >
      {/* ===================================================
          AVATAR AREA

          IMPORTANT:
          This wrapper now has a REAL WIDTH + HEIGHT.

          Before:
          parent had no size
             ↓
          child size-[82%]
             ↓
          82% of nothing
             ↓
          image disappears

          Now:
          wrapper = 210px / 220px / 230px
      =================================================== */}

      <div
        className="
          relative
          flex size-[210px]
          shrink-0
          items-center
          justify-center
          sm:size-[220px]
          md:size-[230px]
        "
      >
        {/* ================================================
            GLOW

            Render only AFTER image loaded.
            Then wait another small moment.
        ================================================= */}

        {/* Animated green circle */}

        {/* Infinite moving dashed circle */}
        {imageLoaded && !imageError && (
          <motion.svg
            aria-hidden="true"
            viewBox="0 0 100 100"
            className="
      pointer-events-none
      absolute inset-0
      size-full
    "
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    scale: 0.9,
                  }
            }
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              opacity: {
                duration: 0.4,
                delay: 0.15 + index * 0.12,
              },
              scale: {
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.15 + index * 0.12,
              },
            }}
          >
            <motion.circle
              cx="50"
              cy="50"
              r="47"
              fill="none"
              stroke="#55B767"
              strokeWidth="2"
              strokeLinecap="round"
              // dash size + gap
              strokeDasharray="7 7"
              initial={{
                strokeDashoffset: 0,
              }}
              animate={{
                strokeDashoffset: -28,
              }}
              transition={{
                duration: 2.5,
                ease: "linear",
                repeat: Infinity,
              }}
            />
          </motion.svg>
        )}

        {/* ================================================
            IMAGE CIRCLE
        ================================================= */}

        <div
          className="
            relative
            size-[82%]
            overflow-hidden
            rounded-full
            bg-gray-100
            dark:bg-gray-800
          "
        >
          {/* Loading placeholder */}

          {!imageLoaded && !imageError && (
            <div
              className="
                absolute inset-0
                animate-pulse
                rounded-full
                bg-gray-200
                dark:bg-gray-700
              "
            />
          )}

          {/* Image */}

          {!imageError && (
            <motion.div
              className="absolute inset-0"
              initial={false}
              animate={{
                opacity: imageLoaded ? 1 : 0,
                scale: imageLoaded ? 1 : 1.03,
              }}
              transition={{
                duration: reduceMotion ? 0 : 0.35,
                ease: EASE_OUT,
              }}
              style={{
                willChange: imageLoaded ? "auto" : "transform, opacity",
              }}
            >
              <Image
                src={avatar}
                alt={name}
                fill
                /*
                 * Removed "unoptimized".
                 *
                 * Let Next.js optimize the images.
                 * This is better when many avatars load together.
                 */
                className="object-cover"
                sizes="
                  (max-width: 640px) 172px,
                  (max-width: 768px) 180px,
                  190px
                "
                /*
                 * Let most member images load lazily.
                 */
                loading={index <= 1 ? "eager" : "lazy"}
                onLoad={() => {
                  setImageLoaded(true);
                  setImageError(false);
                }}
                onError={() => {
                  setImageError(true);
                }}
              />
            </motion.div>
          )}

          {/* ==============================================
              GREEN CIRCLE BORDER

              This is intentionally rendered AFTER image load.

              Image
                ↓
              wait 0.18s
                ↓
              green circle appears
          ============================================== */}

          <AnimatePresence>
            {imageLoaded && !imageError && (
              <motion.div
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute inset-0
                  rounded-full
                  border-[3.5px]
                  border-[#55B767]
                "
                initial={
                  reduceMotion
                    ? false
                    : {
                        opacity: 0,
                        scale: 0.94,
                      }
                }
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                transition={{
                  duration: 0.35,
                  ease: EASE_OUT,
                  delay: reduceMotion ? 0 : 0.18,
                }}
              />
            )}
          </AnimatePresence>

          {/* Image error fallback */}

          {imageError && (
            <div
              className="
                absolute inset-0
                flex items-center
                justify-center
                rounded-full
                border-[3.5px]
                border-[#55B767]
                bg-gray-100
                text-sm
                text-gray-500
                dark:bg-gray-800
                dark:text-gray-400
              "
            >
              No image
            </div>
          )}
        </div>
      </div>

      {/* ===================================================
          MEMBER INFORMATION
      =================================================== */}

      <div className="flex flex-col items-center gap-2 text-center">
        {/* Name */}

        <motion.p
          className="
            font-['Kantumruy_Pro',sans-serif]
            text-lg
            font-semibold
            text-[#1E2E3E]
            dark:text-white
            sm:text-xl
          "
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  y: 10,
                }
          }
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.3,
          }}
          transition={{
            duration: 0.4,
            ease: EASE_OUT,
            delay: cardDelay + 0.18,
          }}
        >
          {name}
        </motion.p>

        {/* Role */}

        <motion.span
          className="
            rounded-full
            px-5 py-1
            font-['Kantumruy_Pro',sans-serif]
            text-sm
            font-medium
            dark:!bg-[#E86C2B]/15
            dark:!text-[#FDBA74]
          "
          style={{
            color: roleColor,
            backgroundColor: roleBg,
          }}
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  y: 8,
                }
          }
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.3,
          }}
          transition={{
            duration: 0.35,
            ease: EASE_OUT,
            delay: cardDelay + 0.25,
          }}
        >
          {role}
        </motion.span>

        {/* Social buttons */}

        <div className="mt-1 flex gap-2">
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
    </motion.article>
  );
}

/* =========================================================
   LEADERS
========================================================= */

const leaders: MemberCardProps[] = [
  {
    id: "l1",
    name: "ហុង វណ្ណដេត",
    role: "Leader",
    roleColor: "#1E2E3E",
    roleBg: "#FEF1E8",

    // IMPORTANT: leading /
    avatar: "/about/lokb.jpg",

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
    avatar: "/about/souheng.jpg",

    socials: {
      facebook: "https://www.facebook.com/USERNAME",
      telegram: "https://t.me/souheng_kim",
      github: "https://github.com/ngovkimsouheng",
    },
  },
];

/* =========================================================
   MEMBERS
========================================================= */

const members: MemberCardProps[] = [
  {
    id: "m1",
    name: "ភឿន សូលីតា",
    role: "FullStack",
    roleColor: "#1E2E3E",
    roleBg: "#FEF1E8",
    avatar: "/about/lyta.jpg",

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
    avatar: "/about/mingyeak.jpg",

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
    avatar: "/about/karona.jpg",

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
    avatar: "/about/thorn.jpg",

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
    avatar: "/about/saroth.png",

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
    avatar: "/about/dara.jpg",

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
    avatar: "/about/longfou.jpg",

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
    avatar: "/about/chanthat.png",

    socials: {
      facebook: "https://www.facebook.com/USERNAME",
      telegram: "https://t.me/Chanthat_Thoeurn",
      github: "https://github.com/ChanthatThoeurn",
    },
  },
];

/* =========================================================
   COMMUNITY SECTION
========================================================= */

export default function CommunitySection() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="px-4 py-12 sm:px-8 md:py-12.5">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}

        <div className="mb-12 text-center sm:mb-16">
          <motion.h2
            className="
              text-3xl
              font-extrabold
              tracking-wide
              sm:text-4xl
              md:text-[48px]
            "
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    y: 20,
                  }
            }
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.5,
            }}
            transition={{
              duration: 0.6,
              ease: EASE_OUT,
            }}
          >
            <span className="text-[#136c34] dark:text-primary-dark">
              សមាជិកក្រុម
            </span>

            <span className="text-[#f97316] dark:text-[#FB923C]">របស់យើង</span>
          </motion.h2>
        </div>

        {/* =================================================
            LEADERS
        ================================================= */}

        <div
          className="
            mb-12
            flex flex-wrap
            justify-center
            gap-8
            sm:mb-16
            sm:gap-12
            md:gap-16
          "
        >
          {leaders.map((member, memberIndex) => (
            <MemberCard key={member.id} {...member} index={memberIndex} />
          ))}
        </div>

        {/* =================================================
            MEMBERS
        ================================================= */}

        <div
          className="
            grid
            grid-cols-1
            justify-items-center
            gap-8
            sm:grid-cols-2
            sm:gap-10
            md:grid-cols-3
            lg:grid-cols-4
          "
        >
          {members.map((member, memberIndex) => (
            <MemberCard key={member.id} {...member} index={memberIndex} />
          ))}
        </div>
      </div>
    </section>
  );
}
