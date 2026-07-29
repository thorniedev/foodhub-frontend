"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, ChevronRight, Sparkles } from "lucide-react";

const allergies = [
  "គ្រាប់សណ្ដែក",
  "ស៊ុត",
  "ទឹកដោះគោ",
  "អាហារសមុទ្រ",
  "សាច់ជ្រូក",
  "Gluten",
  "Sulfites",
];

const diets = [
  { title: "បួស", desc: "គ្មានសាច់ និងផលិតផលពីសត្វ" },
  { title: "អាហារសុខភាព", desc: "ផ្តោតលើអាហារដែលមានជាតិចិញ្ចឹម" },
  { title: "Jain", desc: "ជៀសវាងគ្រឿងផ្សំខ្លះៗ" },
  { title: "Pescatarian", desc: "ញ៉ាំត្រី និងបន្លែ" },
];

const meals = ["ព្រឹក", "ថ្ងៃត្រង់", "ល្ងាច", "យប់", "យប់ជ្រៅ"];

type Props = {
  onDone?: () => void;
};

export default function UserPreferenceWizard({ onDone }: Props) {
  const [step, setStep] = useState(1);

  const [form, setForm] = useState<{
    name: string;
    username: string;
    dob: string;
    gender: string;
    avatar: File | null;
    allergies: string[];
    diet: string;
    meal: string;
  }>({
    name: "",
    username: "",
    dob: "",
    gender: "",
    avatar: null,
    allergies: [],
    diet: "",
    meal: "",
  });

  function toggleArray(value: string) {
    setForm((prev) => ({
      ...prev,
      allergies: prev.allergies.includes(value)
        ? prev.allergies.filter((x) => x !== value)
        : [...prev.allergies, value],
    }));
  }

  function handleSubmit() {
    // TODO: send `form` to your API here
    onDone?.();
  }

  return (
    <div className="w-full">
      {/* STEP HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
            step === 1
              ? "bg-green-700 text-white scale-110"
              : "bg-green-700 text-white"
          }`}
        >
          {step > 1 ? "✓" : "1"}
        </div>

        <div className="h-[2px] flex-1 bg-gray-200 overflow-hidden">
          <motion.div
            animate={{ width: step === 2 ? "100%" : "0%" }}
            className="h-full bg-green-700"
          />
        </div>

        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition ${
            step === 2
              ? "bg-green-700 text-white scale-110"
              : "bg-gray-200 text-gray-500"
          }`}
        >
          2
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-base font-bold text-gray-900">
              សូមបំពេញព័ត៌មានផ្ទាល់ខ្លួន
            </p>
            <p className="text-gray-400 text-sm mt-1 mb-5">
              ព័ត៌មាននេះជួយយើងណែនាំអាហារដែលសាកសមសម្រាប់អ្នក
            </p>

            {/* UPLOAD */}
            <div className="border-2 border-dashed border-green-200 rounded-2xl p-6 text-center hover:bg-green-50 transition cursor-pointer">
              <div className="mx-auto w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-700 mb-3">
                <ImageIcon size={20} />
              </div>
              <h5 className="font-bold text-sm">Drag & drop your photo</h5>
              <p className="text-gray-400 text-xs">or click to browse files</p>
              <div className="flex justify-center gap-2 mt-3">
                {["JPG", "PNG", "WEBP", "GIF"].map((x) => (
                  <span
                    key={x}
                    className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[10px] font-semibold"
                  >
                    {x}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-5">
              <Input
                placeholder="ឈ្មោះ"
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
              />
              <Input
                placeholder="@username"
                value={form.username}
                onChange={(v) => setForm({ ...form, username: v })}
              />
              <Input
                placeholder="ថ្ងៃខែឆ្នាំកំណើត"
                value={form.dob}
                onChange={(v) => setForm({ ...form, dob: v })}
              />
              <Input
                placeholder="ភេទ"
                value={form.gender}
                onChange={(v) => setForm({ ...form, gender: v })}
              />
            </div>

            <button
              onClick={() => setStep(2)}
              className="mt-6 w-full bg-green-700 text-white py-3 rounded-full font-bold text-sm flex justify-center items-center gap-2 hover:bg-green-800 transition"
            >
              បន្ត កំណត់ចំណង់ចំណូលចិត្ត
              <ChevronRight size={18} />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            <h5 className="text-lg font-bold">ចំណង់ចំណូលចិត្តអាហារ</h5>
            <p className="text-gray-400 text-sm mt-1 mb-5">
              ជ្រើសរើសព័ត៌មានដែលជួយឲ្យ FoodHub ផ្តល់អាហារល្អបំផុត
            </p>

            <h3 className="font-bold text-sm mb-2">អាឡែហ្ស៊ី</h3>
            <div className="flex flex-wrap gap-2">
              {allergies.map((item) => (
                <button
                  key={item}
                  onClick={() => toggleArray(item)}
                  className={`px-3 py-1.5 rounded-full border text-sm transition ${
                    form.allergies.includes(item)
                      ? "bg-green-700 text-white border-green-700"
                      : "bg-white hover:border-green-500"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <h3 className="font-bold text-sm mt-6 mb-2">ប្រភេទអាហារ</h3>
            <div className="grid grid-cols-2 gap-3">
              {diets.map((item) => (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ y: -3 }}
                  key={item.title}
                  onClick={() => setForm({ ...form, diet: item.title })}
                  className={`text-left p-4 rounded-2xl border transition ${
                    form.diet === item.title
                      ? "border-green-700 bg-green-50"
                      : "hover:border-green-300"
                  }`}
                >
                  <h4 className="font-bold text-sm">{item.title}</h4>
                  <p className="text-gray-400 text-xs">{item.desc}</p>
                </motion.button>
              ))}
            </div>

            <h3 className="font-bold text-sm mt-6 mb-2">ពេលញ៉ាំអាហារ</h3>
            <div className="flex gap-2 flex-wrap">
              {meals.map((item) => (
                <button
                  key={item}
                  onClick={() => setForm({ ...form, meal: item })}
                  className={`px-4 py-1.5 rounded-full border text-sm transition ${
                    form.meal === item
                      ? "bg-green-700 text-white border-green-700"
                      : ""
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-3 rounded-full border font-bold text-sm hover:bg-gray-50 transition"
              >
                ថយក្រោយ
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 bg-green-700 text-white rounded-full py-3 font-bold text-sm flex justify-center items-center gap-2 hover:bg-green-800 transition"
              >
                បង្កើត Recommendation
                <Sparkles size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Input({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-300"
    />
  );
}
