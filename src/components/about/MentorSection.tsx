// components/MentorSection.tsx
"use client";

import Image from "next/image";

interface SocialButtonProps {
  icon: "gh" | "fb" | "tg";
}

function SocialButton({ icon }: SocialButtonProps) {
  return (
    <button
      aria-label={`Open ${icon}`}
      className="size-10 sm:size-11 rounded-full bg-white text-[#1E2E3E] border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors focus:outline-none shadow-xs"
    >
      {icon === "gh" && (
        <svg className="size-[22px] sm:size-6 fill-current" viewBox="0 0 24 24">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
      )}

      {icon === "fb" && (
        <svg className="size-[22px] sm:size-6 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      )}

      {icon === "tg" && (
        <svg className="size-[22px] sm:size-6 fill-current" viewBox="0 0 24 24">
          <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.119.098.152.228.166.323.014.095.032.312.018.483z" />
        </svg>
      )}
    </button>
  );
}

interface MentorCardProps {
  id: string;
  name: string;
  role: string;
  avatar: string;
  frameSrc?: string;
}

function MentorCard({ name, role, avatar, frameSrc = "/about/frame.png" }: MentorCardProps) {
  return (
    <div className="flex flex-col items-center">
      {/* Frame size adjusted to 280px on mobile -> 320px on desktop */}
      <div className="relative size-[280px] sm:size-[320px] flex items-center justify-center">
        {/* User Image */}
        <div className="relative size-[60%] rounded-full overflow-hidden bg-gray-100">
          <Image
            src={avatar}
            alt={name}
            fill
            unoptimized
            className="object-cover"
            sizes="(max-width: 640px) 200px, 240px"
          />
        </div>

        {/* Frame Overlay */}
        <Image
          src={frameSrc}
          alt="Mentor Card Frame"
          fill
          className="absolute inset-0 size-full object-contain pointer-events-none z-10"
          priority
        />
      </div>

      {/* Info Section */}
      <div className="text-center flex flex-col items-center gap-1.5">
        <p className="font-['Kantumruy_Pro',sans-serif] font-bold text-[#1E2E3E] text-lg sm:text-2xl">
          {name}
        </p>

        <span className="font-['Kantumruy_Pro',sans-serif] text-sm sm:text-base font-semibold px-5 py-1 rounded-full bg-[#E9F9EF] text-[#136C34]">
          {role}
        </span>

        <div className="flex gap-2.5 mt-1.5">
          <SocialButton icon="gh" />
          <SocialButton icon="fb" />
          <SocialButton icon="tg" />
        </div>
      </div>
    </div>
  );
}

const mentors: MentorCardProps[] = [
  {
    id: "mentor-1",
    name: "មុំ រស្មី",
    role: "Mentor",
    avatar: "/about/cher1.jpg",
    frameSrc: "/about/frame.png",
  },
  {
    id: "mentor-2",
    name: "អ៊ឹង លីហហ្សា",
    role: "Mentor",
  avatar: "/about/cher.jpg",
    frameSrc: "/about/frame.png",
  },
];

export default function MentorSection() {
  return (
    <section className=" py-14 md:py-24 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14 sm:mb-16">
          <h2 className="font-['Kantumruy_Pro',sans-serif] font-extrabold text-3xl sm:text-5xl md:text-6xl tracking-wide">
            <span className="text-[#136C34]">Mentors </span>
            <span className="text-[#F97316]">របស់យើង</span>
          </h2>
        </div>

        <div className="flex flex-wrap gap-12 sm:gap-16 md:gap-20 justify-center items-center">
          {mentors.map((mentor) => (
            <MentorCard key={mentor.id} {...mentor} />
          ))}
        </div>
      </div>
    </section>
  );
}