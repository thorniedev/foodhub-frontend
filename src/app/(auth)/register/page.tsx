"use client";

import { FormEvent, useState } from "react";
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

      setSuccessMessage(response.message ?? "Account created successfully.");

      setForm(initialFormState);
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  const errorMessage = registerError ? getErrorMessage(registerError) : "";

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <section className="w-full max-w-2xl rounded-3xl border bg-background p-6 shadow-sm sm:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Create your account
          </h1>

          <p className="mt-2 text-base text-muted-foreground">
            Enter your information to register for FoodHub.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormInput
              label="First name"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              placeholder="Souheng"
              autoComplete="given-name"
            />

            <FormInput
              label="Last name"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              placeholder="Kim"
              autoComplete="family-name"
            />
          </div>

          <FormInput
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="latte"
            autoComplete="username"
          />

          <FormInput
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="name@example.com"
            autoComplete="email"
          />

          <FormInput
            label="Phone number"
            name="phoneNumber"
            type="tel"
            value={form.phoneNumber}
            onChange={handleChange}
            placeholder="+85512345678"
            autoComplete="tel"
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormInput
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
              autoComplete="new-password"
            />

            <FormInput
              label="Confirm password"
              name="confirmedPassword"
              type="password"
              value={form.confirmedPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              autoComplete="new-password"
            />
          </div>

          {validationError ? (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-base text-red-700 dark:bg-red-950/30 dark:text-red-300">
              {validationError}
            </p>
          ) : null}

          {errorMessage ? (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-base text-red-700 dark:bg-red-950/30 dark:text-red-300">
              {errorMessage}
            </p>
          ) : null}

          {successMessage ? (
            <p className="rounded-xl bg-green-50 px-4 py-3 text-base text-green-700 dark:bg-green-950/30 dark:text-green-300">
              {successMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-primary px-5 py-3.5 text-base font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </form>
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
    <div className="space-y-2">
      <label htmlFor={name} className="text-base font-medium">
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
        className="w-full rounded-xl border bg-background px-4 py-3 text-base outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}
