"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRegisterMutation } from "@/app/store/auth/authApi";

interface RegisterFormState {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  password: string;
  confirmedPassword: string;
}

const initialFormState: RegisterFormState = {
  username: "",
  email: "",
  firstName: "",
  lastName: "",
  phoneNumber: "",
  password: "",
  confirmedPassword: "",
};

interface ApiErrorResponse {
  data?: {
    message?: string;
    error?: string;
  };
  error?: string;
}

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null) {
    const apiError = error as ApiErrorResponse;

    if (apiError.data?.message) {
      return apiError.data.message;
    }

    if (apiError.data?.error) {
      return apiError.data.error;
    }

    if (apiError.error) {
      return apiError.error;
    }
  }

  return "Registration failed. Please try again.";
}

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterFormState>(initialFormState);

  const [validationError, setValidationError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [register, { isLoading, error: registerError }] = useRegisterMutation();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setValidationError("");
    setSuccessMessage("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setValidationError("");
    setSuccessMessage("");

    if (form.password !== form.confirmedPassword) {
      setValidationError("Password and confirmed password do not match.");
      return;
    }

    if (form.password.length < 8) {
      setValidationError("Password must contain at least 8 characters.");
      return;
    }

    try {
      const response = await register({
        username: form.username.trim(),
        email: form.email.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        password: form.password,
        confirmedPassword: form.confirmedPassword,
      }).unwrap();

      setSuccessMessage(
        response.message ?? "បង្កើតគណនីបានជោគជ័យ! សូមចូលប្រើប្រាស់គណនីរបស់អ្នក។"
      );

      setForm(initialFormState);
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  const errorMessage = registerError ? getErrorMessage(registerError) : "";

  return (
    <main className="relative flex min-h-screen w-full bg-[#FAF7F2] dark:bg-slate-950 overflow-hidden font-sans">
      {/* 1. LEFT SIDEBAR: DARK PANEL WITH OVERLAPPING DISHES */}
      <section className="relative hidden lg:flex lg:w-4/12 xl:w-3/12 min-h-screen bg-[#1B1C20] flex-col justify-between p-8 z-10 overflow-hidden">
        {/* Brand Header */}
        <div className="z-20 flex items-center gap-3">
          <div className="relative h-10 w-36">
            <Image
              src="/ISTAD-Logo.png"
              alt="FoodHub"
              fill
              className="object-contain object-left invert"
            />
          </div>
        </div>

        {/* Stack of Overlapping Circular Food Dishes */}
        <div className="relative z-20 my-auto flex flex-col items-center justify-center space-y-[-2rem] py-4">
          <div className="relative h-56 w-56 rounded-full border-4 border-white/20 shadow-2xl overflow-hidden transition-transform duration-500 hover:scale-105">
            <Image
              src="/banner/food1.png"
              alt="Food Item 1"
              fill
              className="object-cover"
            />
          </div>

          <div className="relative h-48 w-48 rounded-full border-4 border-white/20 shadow-xl overflow-hidden transition-transform duration-500 hover:scale-105">
            <Image
              src="/banner/food2.png"
              alt="Food Item 2"
              fill
              className="object-cover"
            />
          </div>

          <div className="relative h-40 w-40 rounded-full border-4 border-white/20 shadow-lg overflow-hidden transition-transform duration-500 hover:scale-105">
            <Image
              src="/banner/food3.png"
              alt="Food Item 3"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Footer info */}
        <div className="z-20 text-xs text-slate-400">
          © 2026 FoodHub Cambodia. All rights reserved.
        </div>

        {/* Decorative background grid pattern */}
        <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
      </section>

      {/* 2. RIGHT SECTION: WARM BANNER WITH FORM */}
      <section className="relative flex min-h-screen flex-1 flex-col justify-center items-center px-6 py-12 lg:px-16 z-10">
        {/* TOP-RIGHT ORANGE DIAGONAL WEDGE */}
        <div 
          className="pointer-events-none absolute top-0 right-0 z-0 h-[380px] w-full sm:w-[650px] bg-[#F7A028] dark:opacity-30"
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 25% 0)" }}
        />

        {/* SCATTERED LIGHTNING BOLT ACCENTS */}
        <div className="pointer-events-none absolute top-10 left-12 z-0">
          <svg className="h-8 w-8 text-slate-800 dark:text-white opacity-80" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 2L3 14h7v8l10-12h-7z" />
          </svg>
        </div>
        <div className="pointer-events-none absolute top-16 right-1/3 z-0">
          <svg className="h-7 w-7 text-slate-800 dark:text-white opacity-80" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 2L3 14h7v8l10-12h-7z" />
          </svg>
        </div>
        <div className="pointer-events-none absolute top-1/2 right-12 z-0">
          <svg className="h-8 w-8 text-[#F7A028] opacity-90" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 2L3 14h7v8l10-12h-7z" />
          </svg>
        </div>
        <div className="pointer-events-none absolute bottom-10 right-1/4 z-0">
          <svg className="h-6 w-6 text-slate-800 dark:text-white opacity-70" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 2L3 14h7v8l10-12h-7z" />
          </svg>
        </div>

        {/* FORM CONTAINER */}
        <div className="relative z-10 w-full max-w-lg space-y-6">
          {/* Title Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1B1C20] dark:text-white">
              បង្កើតគណនី FoodHub
            </h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium">
              សូមបញ្ចូលព័ត៌មានរបស់អ្នកដើម្បីចុះឈ្មោះប្រើប្រាស់ FoodHub។
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                label="ឈ្មោះដំបូង (First name)"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="Souheng"
                autoComplete="given-name"
              />

              <FormInput
                label="នាមត្រកូល (Last name)"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Kim"
                autoComplete="family-name"
              />
            </div>

            <FormInput
              label="ឈ្មោះប្រប្រើប្រាស់ (Username)"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="latte"
              autoComplete="username"
            />

            <FormInput
              label="អ៊ីមែល (Email)"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="name@example.com"
              autoComplete="email"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                label="ពាក្យសម្ងាត់ (Password)"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="បញ្ចូលពាក្យសម្ងាត់"
                autoComplete="new-password"
              />

              <FormInput
                label="បញ្ជាក់ពាក្យសម្ងាត់ (Confirm password)"
                name="confirmedPassword"
                type="password"
                value={form.confirmedPassword}
                onChange={handleChange}
                placeholder="បញ្ជាក់ពាក្យសម្ងាត់"
                autoComplete="new-password"
              />
            </div>

            {validationError ? (
              <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:bg-red-950/40 dark:text-red-300">
                {validationError}
              </p>
            ) : null}

            {errorMessage ? (
              <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:bg-red-950/40 dark:text-red-300">
                {errorMessage}
              </p>
            ) : null}

            {successMessage ? (
              <div className="space-y-4 rounded-3xl bg-green-50 p-6 text-green-900 dark:bg-green-950/40 dark:text-green-200 border border-green-200 dark:border-green-800">
                <p className="text-xl font-bold text-green-800 dark:text-green-300">
                  🎉 បង្កើតគណនីជោគជ័យ!
                </p>
                <p className="text-sm text-green-700 dark:text-green-300 leading-relaxed">
                  {successMessage}
                </p>
                <div className="pt-2">
                  <a
                    href="/api/auth/login"
                    className="inline-flex w-full items-center justify-center rounded-full bg-[#70B42C] px-6 py-3.5 text-base font-semibold text-white shadow-lg transition hover:bg-[#60a024]"
                  >
                    ចូលប្រើប្រាស់គណនី
                  </a>
                </div>
              </div>
            ) : null}

            {!successMessage ? (
              <button
                type="submit"
                disabled={isLoading}
                className="mt-3 w-full rounded-full bg-[#70B42C] px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-[#70B42C]/25 transition-all hover:bg-[#60a024] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "កំពុងបង្កើតគណនី..." : "បង្កើតគណនី"}
              </button>
            ) : null}

            {/* Footer Link */}
            <div className="pt-3 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">
              មានគណនីរួចហើយ?{" "}
              <Link
                href="/api/auth/login"
                className="font-bold text-[#70B42C] hover:underline"
              >
                ចូលគណនី
              </Link>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

interface FormInputProps {
  label: string;
  name: keyof RegisterFormState;
  value: string;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  autoComplete?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function FormInput({
  label,
  name,
  value,
  type = "text",
  placeholder,
  autoComplete,
  onChange,
}: FormInputProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-xs font-bold text-slate-700 dark:text-slate-300">
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        className="w-full rounded-2xl border-0 bg-[#ECECEE] dark:bg-slate-800/80 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#70B42C] dark:focus:bg-slate-800"
      />
    </div>
  );
}
