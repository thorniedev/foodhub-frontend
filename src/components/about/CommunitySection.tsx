// components/CommunitySection.tsx
"use client";

import Image from "next/image";

interface SocialButtonProps {
  icon: "fb" | "tg" | "gh";
}

function SocialButton({ icon }: SocialButtonProps) {
  return (
    <button
      aria-label={`Open ${icon}`}
      className="size-9 rounded-full bg-white text-[#1E2E3E] border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors focus:outline-none shadow-sm"
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
    </button>
  );
}

interface MemberCardProps {
  id: string;
  name: string;
  role: string;
  roleColor: string;
  roleBg: string;
  avatar: string;
}

function MemberCard({
  name,
  role,
  roleColor,
  roleBg,
  avatar,
}: MemberCardProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      {/* Outer Wrapper for Avatar with Ring Elements */}
      <div className="relative size-[190px] sm:size-[220px] flex items-center justify-center">
        {/* Outer Orange Dashed SVG Circle */}
        <svg
          className="absolute inset-0 size-full pointer-events-none"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="#E86C2B"
            strokeWidth="1.8"
            strokeDasharray="6 4"
          />
        </svg>

        {/* Inner Avatar Container with Green Border */}
        <div className="relative size-[82%] rounded-full border-[3.5px] border-[#55B767] overflow-hidden bg-gray-100">
          <Image
            src={avatar}
            alt={name}
            fill
            unoptimized
            className="object-cover"
            sizes="(max-width: 640px) 180px, 210px"
          />
        </div>

        {/* Small Green Accent Circle on bottom right */}
        <div className="absolute bottom-[23%] right-[10%] size-5 sm:size-6 rounded-full bg-[#55B767] border-2 border-white" />
      </div>

      {/* Info Section */}
      <div className="text-center flex flex-col items-center gap-2">
        <p className="font-['Kantumruy_Pro',sans-serif] font-semibold text-[#1E2E3E] text-lg sm:text-xl">
          {name}
        </p>

        {/* Role Badge */}
        <span
          className="font-['Kantumruy_Pro',sans-serif] text-sm font-medium px-5 py-1 rounded-full"
          style={{ color: roleColor, backgroundColor: roleBg }}
        >
          {role}
        </span>

        {/* Social Buttons */}
        <div className="flex gap-2 mt-1">
          <SocialButton icon="fb" />
          <SocialButton icon="tg" />
          <SocialButton icon="gh" />
        </div>
      </div>
    </div>
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
  },
  {
    id: "l2",
    name: "ងូវ​ ស៊ូហេង",
    role: "Sub-Leader",
    roleColor: "#1E2E3E",
    roleBg: "#FEF1E8",
    avatar: "about/souheng.jpg",
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
  },
  {
    id: "m2",
    name: "ហ័ង ម៉េងយៀក",
    role: "Frontend",
    roleColor: "#1E2E3E",
    roleBg: "#FEF1E8",
    avatar: "about/mingyeak.jpg",
  },
  {
    id: "m3",
    name: "សំ ករុណា",
    role: "Backend",
    roleColor: "#1E2E3E",
    roleBg: "#FEF1E8",
    avatar: "about/karona.jpg",
  },
  {
    id: "m4",
    name: "គឹម ចាន់ថន",
    role: "FullStack",
    roleColor: "#1E2E3E",
    roleBg: "#FEF1E8",
    avatar: "about/thorn.jpg",
  },
  {
    id: "m5",
    name: "ឡេង សារ័ត្ម",
    role: "FullStack",
    roleColor: "#1E2E3E",
    roleBg: "#FEF1E8",
    avatar: "about/saroth.png",
  },
  {
    id: "m6",
    name: "រឿម តារា",
    role: "FullStack",
    roleColor: "#1E2E3E",
    roleBg: "#FEF1E8",
    avatar: "about/dara.jpg",
  },
  {
    id: "m7",
    name: "លីម ឡុងហ្វ៊ូ",
    role: "FullStack",
    roleColor: "#1E2E3E",
    roleBg: "#FEF1E8",
    avatar: "about/longfou.jpg",
  },
  {
    id: "m8",
    name: "ធឿន ចន្ថាត",
    role: "FullStack",
    roleColor: "#1E2E3E",
    roleBg: "#FEF1E8",
    avatar: "about/chanthat.png",
  },
];

export default function CommunitySection() {
  return (
    <section className=" py-12 md:py-20 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-['Kantumruy_Pro',sans-serif] font-extrabold text-3xl sm:text-4xl md:text-[48px] tracking-wide">
            <span className="text-[#136c34]">សមាជិកក្រុម </span>
            <span className="text-[#f97316]">របស់យើង</span>
          </h2>
        </div>

        {/* Leaders Row */}
        <div className="flex flex-wrap gap-8 sm:gap-12 md:gap-16 justify-center mb-12 sm:mb-16">
          {leaders.map((member) => (
            <MemberCard key={member.id} {...member} />
          ))}
        </div>

        {/* Members Grid (4 columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 sm:gap-10 justify-items-center">
          {members.map((member) => (
            <MemberCard key={member.id} {...member} />
          ))}
        </div>
      </div>
    </section>
  );
}
