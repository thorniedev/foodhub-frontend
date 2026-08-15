"use client";

import { useMemo, useState } from "react";
import {
  motion,
  AnimatePresence,
  LayoutGroup,
  useReducedMotion,
} from "framer-motion";

type Tag = "ហឹរ" | "សម្ល" | "អាំង" | "បង្អែម" | "បួស";

const FILTERS: { key: Tag | "all"; label: string }[] = [
  { key: "all", label: "ទាំងអស់" },
  { key: "ហឹរ", label: "ហឹរ" },
  { key: "សម្ល", label: "សម្ល" },
  { key: "អាំង", label: "អាំង" },
  { key: "បង្អែម", label: "បង្អែម" },
  { key: "បួស", label: "បួស" },
];

const ITEMS: {
  name: string;
  store: string;
  tags: Tag[];
  img: string;
  tall?: boolean;
}[] = [
  {
    name: "សម្លម្ជូរគ្រឿង",
    store: "ផ្ទះបាយយាយ",
    tags: ["សម្ល"],
    img: "/Image/food/food1.png",
    tall: true,
  },
  {
    name: "ក្ដាមម្រេចខ្ចី",
    store: "ឆ្នេរកែប",
    tags: ["ហឹរ"],
    img: "/Image/food/food2.png",
  },
  {
    name: "ត្រីអាំងជ្រក់",
    store: "ទន្លេបាសាក់",
    tags: ["អាំង"],
    img: "/Image/food/food3.png",
  },
  {
    name: "នំបញ្ចុកបួស",
    store: "វត្តភ្នំ",
    tags: ["បួស", "សម្ល"],
    img: "/Image/food/food4.png",
  },
  {
    name: "សាច់គោអាំងទឹកគ្រឿង",
    store: "ផ្សារកណ្ដាល",
    tags: ["អាំង", "ហឹរ"],
    img: "/Image/food/food5.png",
    tall: true,
  },
  {
    name: "នំអន្សមចេក",
    store: "ផ្សារបូរីកីឡា",
    tags: ["បង្អែម"],
    img: "/Image/food/food7.png",
  },
  {
    name: "ត្រកួនឆាខ្ទឹម",
    store: "ផ្ទះបាយស្រុក",
    tags: ["បួស"],
    img: "/Image/food/food9.png",
  },
  {
    name: "បបរសណ្ដែកស្ករត្នោត",
    store: "ផ្សារព្រឹក",
    tags: ["បង្អែម", "បួស"],
    img: "/Image/food/food10.png",
  },
];

export default function MarketWallSection() {
  const reduce = useReducedMotion();
  const [filter, setFilter] = useState<Tag | "all">("all");

  const visible = useMemo(
    () =>
      filter === "all" ? ITEMS : ITEMS.filter((i) => i.tags.includes(filter)),
    [filter],
  );

  return (
    <section className="relative overflow-hidden bg-secondary-500 py-20 md:py-28">
      {/* ticker */}
      <div className="absolute inset-x-0 top-0 z-20 overflow-hidden border-y-[3px] border-primary-950 bg-accent-300 py-2.5">
        <motion.div
          className="flex whitespace-nowrap"
          animate={reduce ? {} : { x: ["0%", "-50%"] }}
          transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
        >
          {Array.from({ length: 2 }).flatMap((_, dup) =>
            [
              "ជ្រើសរើសតាមចំណូលចិត្ត",
              "រកឃើញហាងជិតអ្នក",
              "ម្ហូបខ្មែរសុទ្ធ",
              "ថ្មីរាល់ថ្ងៃ",
            ].map((t, i) => (
              <span
                key={`${dup}-${i}`}
                className="mx-7 text-lg font-bold uppercase tracking-wide text-primary-950"
              >
                {t} <span className="mx-2">✱</span>
              </span>
            )),
          )}
        </motion.div>
      </div>

      <div className="relative mx-auto max-w-6xl px-6 pt-14 md:px-10">
        {/* header + chips */}
        <div className="mb-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="max-w-lg text-3xl font-black leading-tight text-primary-950 md:text-5xl">
              ជ្រើសរសជាតិ រួចមើលអ្វីដែលនៅសល់
            </h2>
            <p className="mt-4 flex items-center gap-3 text-lg font-semibold text-primary-950/70">
              <motion.span
                key={visible.length}
                initial={reduce ? false : { y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="inline-grid h-9 min-w-9 place-items-center rounded-full border-[3px] border-primary-950 bg-white px-2 text-lg font-black"
              >
                {visible.length}
              </motion.span>
              មុខម្ហូបត្រូវនឹងការជ្រើសរើស
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {FILTERS.map((f) => {
              const on = filter === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  aria-pressed={on}
                  className={`relative rounded-full border-[3px] border-primary-950 px-5 py-2 text-lg font-bold outline-none transition-all duration-200 focus-visible:ring-4 focus-visible:ring-primary-950/30 ${
                    on
                      ? "translate-x-[3px] translate-y-[3px] bg-primary-950 text-accent-300 shadow-none"
                      : "bg-white text-primary-950 shadow-[4px_4px_0_0_#052e16] hover:-translate-y-0.5"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* wall */}
        <LayoutGroup>
          <motion.div
            layout={!reduce}
            className="grid auto-rows-[190px] grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4"
          >
            <AnimatePresence mode="popLayout">
              {visible.map((item) => (
                <motion.article
                  key={item.name}
                  layout={!reduce}
                  initial={
                    reduce ? false : { opacity: 0, scale: 0.86, rotate: -3 }
                  }
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={
                    reduce
                      ? { opacity: 0 }
                      : { opacity: 0, scale: 0.86, rotate: 3 }
                  }
                  transition={{
                    layout: { type: "spring", stiffness: 220, damping: 26 },
                    duration: 0.32,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className={`group relative overflow-hidden rounded-[22px] border-[3px] border-primary-950 bg-white shadow-[6px_6px_0_0_#052e16] ${
                    item.tall ? "row-span-2" : ""
                  }`}
                >
                  <img
                    src={item.img}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                  />

                  {/* label plate */}
                  <div className="absolute inset-x-0 bottom-0 border-t-[3px] border-primary-950 bg-white/95 px-4 py-3 backdrop-blur-sm">
                    <p className="truncate text-lg font-black text-primary-950">
                      {item.name}
                    </p>
                    <p className="mt-0.5 truncate text-lg text-primary-950/60">
                      {item.store}
                    </p>
                  </div>

                  {/* tag pin */}
                  <span className="absolute right-3 top-3 rounded-full border-[3px] border-primary-950 bg-accent-300 px-3 py-1 text-lg font-bold text-primary-950">
                    {item.tags[0]}
                  </span>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>

        {/* empty state */}
        {visible.length === 0 && (
          <div className="mt-10 rounded-[22px] border-[3px] border-dashed border-primary-950 px-6 py-14 text-center">
            <p className="text-lg font-bold text-primary-950">
              គ្មានមុខម្ហូបក្នុងប្រភេទនេះទេ
            </p>
            <button
              type="button"
              onClick={() => setFilter("all")}
              className="mt-5 rounded-full border-[3px] border-primary-950 bg-white px-6 py-2 text-lg font-bold text-primary-950 shadow-[4px_4px_0_0_#052e16]"
            >
              មើលទាំងអស់
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
