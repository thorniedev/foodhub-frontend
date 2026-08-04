"use client";
import { IoCameraOutline } from "react-icons/io5";
import { useState } from "react";
import { FaRegUser } from "react-icons/fa";
import { RiShieldCheckLine } from "react-icons/ri";
import { FaUtensils } from "react-icons/fa";
import { FiAlertTriangle } from "react-icons/fi";
import { FaRegStar } from "react-icons/fa";
import TagToggle from "./TagToggle";
import FoodChipInput from "./FoodChipInput";
import type { TagOption, UserProfile } from "@/types/dashboard";

const healthGoalOptions: TagOption[] = [
  { id: "lose_weight", label: "សម្រកទម្ងន់" },
  { id: "gain_weight", label: "បង្កើនទម្ងន់" },
  { id: "eat_healthy", label: "សុខភាពល្អ" },
  { id: "maintain_weight", label: "រក្សាទម្ងន់" },
  { id: "muscle_gain", label: "បង្កើនភាពធន់" },
  { id: "control_weight", label: "បង្កើនប្រព័ន្ធភាពធន់" },
];

const dietaryOptions: TagOption[] = [
  { id: "no_pork", label: "គ្មានពាក់ព័ន្ធសាំង" },
  { id: "gluten_free", label: "គេងលំបានឡប្រសើរ" },
];

const allergyOptions: TagOption[] = [
  { id: "peanuts", label: "គ្រីតែន", variant: "warning" },
  { id: "seafood", label: "ផលិតផលិកដោះគោ", variant: "warning" },
  { id: "eggs", label: "ក្រៀមសម្រូល" },
  { id: "milk", label: "គ្រប់ធញ្ញជាតិ" },
  { id: "soy", label: "សណ្ដែកសៀង" },
  { id: "nuts", label: "ល" },
  { id: "shellfish", label: "ស្រូវសាលី" },
  { id: "fish", label: "គ្រី" },
  { id: "sesame", label: "សណ្ដែកដី" },
];

const cuisineOptions: TagOption[] = [
  { id: "khmer", label: "អាហារខ្មែរ" },
  { id: "chinese", label: "ចិន" },
  { id: "japanese", label: "ជប៉ុន" },
  { id: "korean", label: "កូរ៉េ" },
  { id: "thai", label: "ថៃ" },
  { id: "vietnamese", label: "វៀតណាម" },
  { id: "mediterranean", label: "មេឌីទែរ៉ាណេ" },
  { id: "indian", label: "ឥណ្ឌា" },
  { id: "italian", label: "អ៊ីតាលី" },
  { id: "american", label: "អាមេរិក" },
];

const initialProfile: UserProfile = {
  fullName: "សុខ រស្មី",
  gender: "ស្រី",
  bio: "មានចំណង់ចំណូលចិត្តលើការទទួលទានអាហារសុខភាព និងការធ្វើលំហាត់ប្រាណដោយកិច្ចទុកដាក់ៗ",
  email: "reksmey@email.com",
  phone: "+(855) 234-8821",
  birthDate: "1993-08-14",
  age: 33,
  memberSinceDays: 55,
  goalsInProgress: 2,
  avatarInitials: "រស",
};

function toggleInList(list: string[], id: string) {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

export default function UserDashboard() {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [healthGoals, setHealthGoals] = useState<string[]>([
    "eat_healthy",
    "muscle_gain",
  ]);
  const [dietary, setDietary] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>(["peanuts", "seafood"]);
  const [cuisines, setCuisines] = useState<string[]>([
    "korean",
    "japanese",
    "vietnamese",
  ]);
  const [likedFoods, setLikedFoods] = useState<string[]>([
    "នំបុ័ង",
    "អាម៉ុកគ្រី",
    "សម្លម្ជូរ",
  ]);
  const [dislikedFoods, setDislikedFoods] = useState<string[]>([
    "សាច់ក្របី",
    "សួស",
  ]);

  return (
    <div className="mx-auto max-w-6xl px-3 py-4 sm:px-4 sm:py-6">
      {/* Profile banner */}
      {/* <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="relative h-20 bg-gradient-to-r from-primary-100 to-primary-200 sm:h-32" />
        <div className="relative px-4 pb-5 sm:px-6 sm:pb-6">
          <div className="-mt-8 flex flex-col gap-4 sm:-mt-10 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
            <div className="flex items-end gap-3 sm:gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-[#136C34] text-lg font-bold text-white shadow-sm sm:h-20 sm:w-20 sm:text-2xl">
                {profile.avatarInitials}
              </div>
              <div className="min-w-0 pb-1">
                <p className="truncate text-xl font-bold text-slate-800 sm:text-4xl">
                  {profile.fullName}
                </p>
                <p className="truncate text-sm text-slate-500 sm:text-base">
                  {profile.email}
                </p>
              </div>
            </div>
            <button className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 sm:mt-2 sm:w-auto">
              <IoCameraOutline />
              ផ្លាស់ប្តូររូបភាព
            </button>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-4">
            <StatCard
              label="ធម្មតា"
              value={profile.memberSinceDays}
              sublabel="ថ្ងៃជាសមាជិក"
            />
            <StatCard
              label="អាយុ"
              value={profile.age}
              sublabel="ឆ្នាំ"
              accent="text-emerald-600"
            />
            <StatCard
              label="គោលដៅ"
              value={profile.goalsInProgress}
              sublabel="គោលដៅដែលកំពុងដំណើរការ"
            />
          </div>
        </div>
      </div> */}

      {/* Personal info */}
      {/* <SectionCard
        icon={<FaRegUser />}
        title="ព័ត៌មានផ្ទាល់ខ្លួន"
        className="mt-4 sm:mt-5"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="ឈ្មោះពេញ">
            <input
              value={profile.fullName}
              onChange={(e) =>
                setProfile({ ...profile, fullName: e.target.value })
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-500"
            />
          </Field>
          <Field label="ភេទ">
            <select
              value={profile.gender}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  gender: e.target.value as UserProfile["gender"],
                })
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-500"
            >
              <option value="ស្រី">ស្រី</option>
              <option value="ប្រុស">ប្រុស</option>
              <option value="មិនបញ្ជាក់">មិនបញ្ជាក់</option>
            </select>
          </Field>
          <Field label="ជីវប្រវត្តិ" className="sm:col-span-2">
            <textarea
              value={profile.bio}
              maxLength={200}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-500 min-h-[80px] resize-none"
            />
            <p className="mt-1 text-right text-base text-slate-400">
              {profile.bio.length}/200
            </p>
          </Field>
          <Field label="អ៊ីមែល">
            <input
              value={profile.email}
              onChange={(e) =>
                setProfile({ ...profile, email: e.target.value })
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-500"
            />
          </Field>
          <Field label="លេខទូរស័ព្ទ">
            <input
              value={profile.phone}
              onChange={(e) =>
                setProfile({ ...profile, phone: e.target.value })
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-500"
            />
          </Field>
          <Field label="ថ្ងៃខែឆ្នាំកំណើត">
            <input
              type="date"
              value={profile.birthDate}
              onChange={(e) =>
                setProfile({ ...profile, birthDate: e.target.value })
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-500"
            />
          </Field>
          <Field label="អាយុ">
            <input
              type="number"
              value={profile.age}
              onChange={(e) =>
                setProfile({ ...profile, age: Number(e.target.value) })
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-500"
            />
          </Field>
        </div>
      </SectionCard> */}

      {/* Health goals */}
      <SectionCard
        icon={<RiShieldCheckLine />}
        title="គោលដៅក្នុងការថែរក្សាសុខភាព"
        className="mt-4 sm:mt-5"
      >
        <div className="flex flex-wrap gap-2">
          {healthGoalOptions.map((opt) => (
            <TagToggle
              key={opt.id}
              label={opt.label}
              selected={healthGoals.includes(opt.id)}
              onToggle={() => setHealthGoals(toggleInList(healthGoals, opt.id))}
            />
          ))}
        </div>
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
          <RiShieldCheckLine className="mt-0.5 shrink-0" />
          FoodHub AI នឹងផ្តល់ការណែនាំដែលត្រូវបានកែសម្រួលជាពិសេសសម្រាប់អ្នក
          ដោយផ្អែកលើគោលដៅទាំង {healthGoals.length} ដែលអ្នកបានជ្រើសរើស។
        </div>
      </SectionCard>

      {/* Dietary restrictions + allergies */}
      <div className="mt-4 grid gap-4 sm:mt-5 sm:gap-5 md:grid-cols-2">
        <SectionCard icon={<FaUtensils />} title="ចំណូលចិត្តផ្នែកអាហារ">
          <div className="flex flex-wrap gap-2">
            {dietaryOptions.map((opt) => (
              <TagToggle
                key={opt.id}
                label={opt.label}
                selected={dietary.includes(opt.id)}
                onToggle={() => setDietary(toggleInList(dietary, opt.id))}
              />
            ))}
          </div>
        </SectionCard>

        <SectionCard icon={<FiAlertTriangle />} title="អាឡែស៊ីនិងអាហារ">
          <div className="flex flex-wrap gap-2">
            {allergyOptions.map((opt) => (
              <TagToggle
                key={opt.id}
                label={opt.label}
                selected={allergies.includes(opt.id)}
                onToggle={() => setAllergies(toggleInList(allergies, opt.id))}
                variant="warning"
              />
            ))}
          </div>
          {allergies.length > 0 && (
            <p className="mt-3 flex items-start gap-1.5 text-base text-orange-600">
              <FiAlertTriangle className="mt-0.5 shrink-0" />
              របស់ទាំងនេះនឹងត្រូវបានចៀសវាងក្នុងអាហារដែលណែនាំដល់អ្នក
            </p>
          )}
        </SectionCard>
      </div>

      {/* Cuisine preferences */}
      <SectionCard
        icon={<FaRegStar />}
        title="មុខម្ហូបដែលពេញចិត្ត"
        className="mt-4 sm:mt-5"
      >
        <div className="flex flex-wrap gap-2">
          {cuisineOptions.map((opt) => (
            <TagToggle
              key={opt.id}
              label={opt.label}
              selected={cuisines.includes(opt.id)}
              onToggle={() => setCuisines(toggleInList(cuisines, opt.id))}
            />
          ))}
        </div>
      </SectionCard>

      {/* Favorite foods */}
      <SectionCard
        icon={<FaRegStar />}
        title="ចំណូលចិត្តអាហារ"
        className="mt-4 sm:mt-5"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <FoodChipInput
            label="អាហារដែលចូលចិត្ត"
            chips={likedFoods}
            onChange={setLikedFoods}
            chipColor="green"
          />
          <FoodChipInput
            label="អាហារដែលគួរជៀសវាង"
            chips={dislikedFoods}
            onChange={setDislikedFoods}
            chipColor="red"
          />
        </div>
      </SectionCard>

      {/* Actions */}
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button className="w-full rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 sm:w-auto">
          លុបចោល
        </button>
        <button className="w-full rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 sm:w-auto">
          រក្សាទុកការផ្លាស់ប្តូរ
        </button>
      </div>
    </div>
  );
}

/* --- small local presentational helpers --- */

function StatCard({
  label,
  value,
  sublabel,
  accent = "text-slate-800",
}: {
  label: string;
  value: number;
  sublabel: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-2.5 sm:p-4">
      <p className="text-base text-slate-500 sm:text-sm">{label}</p>
      <p className={`text-lg font-bold sm:text-2xl ${accent}`}>{value}</p>
      <p className="truncate text-[10px] text-slate-400 sm:text-base">
        {sublabel}
      </p>
    </div>
  );
}

function SectionCard({
  icon,
  title,
  children,
  className = "",
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 ${className}`}
    >
      <div className="mb-4 flex items-center gap-2 text-slate-800">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          {icon}
        </span>
        <p className="text-lg font-semibold sm:text-2xl">{title}</p>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}
