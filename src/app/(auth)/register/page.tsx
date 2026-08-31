// "use client";

// import Image from "next/image";
// import Link from "next/link";
// import { FormEvent, useState } from "react";
// import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
// import { useRegisterMutation } from "@/app/store/auth/authApi";

// // Replace this path with your own logo, for example: "/images/foodhub-logo.png".
// const LOGO_SRC = "/Image/foodHub-logo.png";

// interface FieldErrors {
//   firstName?: string;
//   lastName?: string;
//   email?: string;
//   password?: string;
//   confirmedPassword?: string;
// }

// export default function RegisterPage() {
//   const [firstName, setFirstName] = useState("");
//   const [lastName, setLastName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmedPassword, setConfirmedPassword] = useState("");
//   const [isPasswordVisible, setIsPasswordVisible] = useState(false);
//   const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
//     useState(false);
//   const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
//   const [apiError, setApiError] = useState<string | null>(null);
//   const [successMessage, setSuccessMessage] = useState<string | null>(null);
//   const [register, { isLoading }] = useRegisterMutation();

//   const clearFieldError = (field: keyof FieldErrors) => {
//     if (fieldErrors[field]) {
//       setFieldErrors((current) => ({ ...current, [field]: undefined }));
//     }
//   };

//   const validateForm = () => {
//     const errors: FieldErrors = {};
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//     if (!firstName.trim()) errors.firstName = "សូមបញ្ចូលនាមខ្លួន";
//     if (!lastName.trim()) errors.lastName = "សូមបញ្ចូលនាមត្រកូល";
//     if (!email.trim()) errors.email = "សូមបញ្ចូលអ៊ីមែល";
//     else if (!emailRegex.test(email.trim()))
//       errors.email = "ទម្រង់អ៊ីមែលមិនត្រឹមត្រូវ";
//     if (!password) errors.password = "សូមបញ្ចូលពាក្យសម្ងាត់";
//     else if (password.length < 8)
//       errors.password = "ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច ៨ តួអក្សរ";
//     if (!confirmedPassword) errors.confirmedPassword = "សូមបញ្ជាក់ពាក្យសម្ងាត់";
//     else if (confirmedPassword !== password)
//       errors.confirmedPassword = "ពាក្យសម្ងាត់ទាំងពីរមិនត្រូវគ្នា";

//     setFieldErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
//     event.preventDefault();
//     setApiError(null);
//     setSuccessMessage(null);
//     if (!validateForm()) return;

//     try {
//       const response = await register({
//         firstName: firstName.trim(),
//         lastName: lastName.trim(),
//         email: email.trim(),
//         username: email.trim(),
//         phoneNumber: "",
//         password,
//         confirmedPassword,
//       }).unwrap();

//       setSuccessMessage(
//         response.message || "បង្កើតគណនីបានជោគជ័យ! អ្នកអាចចូលគណនីឥឡូវនេះ។",
//       );
//       setFirstName("");
//       setLastName("");
//       setEmail("");
//       setPassword("");
//       setConfirmedPassword("");
//       setFieldErrors({});
//     } catch (error: unknown) {
//       const requestError = error as {
//         data?: { message?: string; error?: string };
//         error?: string;
//         message?: string;
//       };
//       setApiError(
//         requestError?.data?.message ||
//           requestError?.data?.error ||
//           requestError?.error ||
//           requestError?.message ||
//           "ការចុះឈ្មោះមិនបានជោគជ័យទេ។ សូមព្យាយាមម្តងទៀត។",
//       );
//     }
//   };

//   const inputClass = (hasError?: string) =>
//     `h-12 w-full rounded-xl border bg-[#F8FAF8] px-4 text-lg text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 ${
//       hasError
//         ? "border-red-400 focus:border-red-500 focus:ring-red-100"
//         : "border-slate-200 focus:border-[#136B34] focus:ring-[#136B34]/10"
//     }`;

//   return (
//     <main className="min-h-screen bg-white px-4 py-8 sm:px-8 lg:flex lg:items-center lg:px-12">
//       <section className="relative mx-auto w-full max-w-7xl overflow-hidden bg-[#FFF9F2] lg:h-[650px]">
//         <svg
//           aria-hidden="true"
//           viewBox="0 0 360 290"
//           className="pointer-events-none absolute left-0 top-0 hidden h-[160px] W-[190px] text-[#136B34] lg:block"
//         >
//           <path
//             fill="currentColor"
//             d="M0 0h360v25c0 78-12 102-64 98l-79-8c-36-4-55 11-54 48l4 65c3 42-26 62-92 62H0V0Z"
//           />
//         </svg>
//         <svg
//           aria-hidden="true"
//           viewBox="0 0 330 345"
//           className="pointer-events-none absolute right-0 top-0 hidden h-[160px]  text-[#136B34] lg:block"
//         >
//           <path
//             fill="currentColor"
//             d="M330 0H0c0 66 3 113 20 120 25 10 63-10 95 0 37 12 25 64 30 107 7 63 63 101 185 118V0Z"
//           />
//         </svg>
//         <svg
//           aria-hidden="true"
//           viewBox="0 0 500 300"
//           className="pointer-events-none absolute bottom-0 left-0 hidden h-[160px] w-[270px] text-[#136B34] lg:block"
//         >
//           <path
//             fill="currentColor"
//             d="M0 300V74C17 18 91 0 124 44c26 35-1 111 31 137 27 22 71-4 117-34 87-58 157-13 228 63v90H0Z"
//           />
//         </svg>

//       </section>
//     </main>
//   );
// }

"use client";

import React, { FormEvent, useState } from "react";
import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";
import {
  EyeIcon,
  EyeOffIcon,
  AlertCircleIcon,
  CheckCircleIcon,
} from "@/components/auth/icons";
import { useRegisterMutation } from "@/app/store/auth/authApi";

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmedPassword?: string;
}

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [register, { isLoading }] = useRegisterMutation();

  const validateForm = (): boolean => {
    const errors: FieldErrors = {};

    if (!firstName.trim()) {
      errors.firstName = "សូមបញ្ចូលនាមខ្លួន (First name is required)";
    }

    if (!lastName.trim()) {
      errors.lastName = "សូមបញ្ចូលនាមត្រកូល (Last name is required)";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errors.email = "សូមបញ្ចូលអ៊ីមែល (Email is required)";
    } else if (!emailRegex.test(email.trim())) {
      errors.email = "ទម្រង់អ៊ីមែលមិនត្រឹមត្រូវ (Invalid email format)";
    }

    if (!password) {
      errors.password = "សូមបញ្ចូលពាក្យសម្ងាត់ (Password is required)";
    } else if (password.length < 8) {
      errors.password =
        "ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច ៨ តួអក្សរ (Minimum 8 characters)";
    }

    if (!confirmedPassword) {
      errors.confirmedPassword =
        "សូមបញ្ជាក់ពាក្យសម្ងាត់ (Please confirm your password)";
    } else if (confirmedPassword !== password) {
      errors.confirmedPassword =
        "ពាក្យសម្ងាត់បញ្ជាក់មិនត្រូវគ្នាទេ (Passwords do not match)";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApiError(null);
    setSuccessMessage(null);

    if (!validateForm()) {
      return;
    }

    try {
      const response = await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        username: email.trim(),
        phoneNumber: "",
        password,
        confirmedPassword,
      }).unwrap();

      setSuccessMessage(
        response.message ||
          "បង្កើតគណនីបានជោគជ័យ! សូមចូលប្រើប្រាស់គណនីរបស់អ្នក។",
      );
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setConfirmedPassword("");
      setFieldErrors({});
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null) {
        const anyErr = err as {
          data?: { message?: string; error?: string };
          error?: string;
          message?: string;
        };
        const message =
          anyErr.data?.message ||
          anyErr.data?.error ||
          anyErr.error ||
          anyErr.message ||
          "ការចុះឈ្មោះមិនបានជោគជ័យទេ។ សូមព្យាយាមម្តងទៀត។";
        setApiError(message);
      } else {
        setApiError("ការចុះឈ្មោះមិនបានជោគជ័យទេ។ សូមព្យាយាមម្តងទៀត។");
      }
    }
  };

  return (
    <AuthLayout>
      <div className="kc-login-header-group">
        <h1 className="kc-title">បង្កើតគណនី FoodHub</h1>
        <p className="kc-subtitle">ចូលរួមជាមួយ FoodHub ហើយរកមើលអាហារឆ្ងាញ់ៗ</p>
      </div>

      {apiError && (
        <div className="kc-alert kc-alert-error" role="alert">
          <AlertCircleIcon className="shrink-0 mt-0.5" />
          <span>{apiError}</span>
        </div>
      )}

      {successMessage && (
        <div className="kc-alert kc-alert-success" role="alert">
          <CheckCircleIcon className="shrink-0 mt-0.5" />
          <div className="flex flex-col gap-2">
            <span>{successMessage}</span>
            <Link
              href="/api/auth/login"
              className="kc-link underline font-bold"
            >
              ចូលគណនីឥឡូវនេះ &rarr;
            </Link>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="kc-form" noValidate>
        {/* First & Last Name Row */}
        <div className="kc-field-row">
          <div className="kc-field">
            <input
              id="firstName"
              name="firstName"
              type="text"
              className="kc-input kc-pill-input"
              placeholder="First Name / នាមខ្លួន"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                if (fieldErrors.firstName) {
                  setFieldErrors((prev) => ({ ...prev, firstName: undefined }));
                }
              }}
              autoComplete="given-name"
              aria-invalid={!!fieldErrors.firstName}
            />
            {fieldErrors.firstName && (
              <span className="kc-field-error">{fieldErrors.firstName}</span>
            )}
          </div>

          <div className="kc-field">
            <input
              id="lastName"
              name="lastName"
              type="text"
              className="kc-input kc-pill-input"
              placeholder="Last Name / នាមត្រកូល"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                if (fieldErrors.lastName) {
                  setFieldErrors((prev) => ({ ...prev, lastName: undefined }));
                }
              }}
              autoComplete="family-name"
              aria-invalid={!!fieldErrors.lastName}
            />
            {fieldErrors.lastName && (
              <span className="kc-field-error">{fieldErrors.lastName}</span>
            )}
          </div>
        </div>

        {/* Email Field */}
        <div className="kc-field">
          <input
            id="email"
            name="email"
            type="email"
            className="kc-input kc-pill-input"
            placeholder="E-mail / អ៊ីមែល"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) {
                setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }
            }}
            autoComplete="email"
            aria-invalid={!!fieldErrors.email}
          />
          {fieldErrors.email && (
            <span className="kc-field-error">{fieldErrors.email}</span>
          )}
        </div>

        {/* Password Field */}
        <div className="kc-field">
          <div className="kc-input-wrap">
            <input
              id="password"
              name="password"
              type={isPasswordVisible ? "text" : "password"}
              className="kc-input kc-pill-input"
              placeholder="Password / ពាក្យសម្ងាត់"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) {
                  setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }
              }}
              autoComplete="new-password"
              aria-invalid={!!fieldErrors.password}
            />
            <button
              type="button"
              className="kc-input-icon-btn"
              onClick={() => setIsPasswordVisible((prev) => !prev)}
              aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            >
              {isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {fieldErrors.password && (
            <span className="kc-field-error">{fieldErrors.password}</span>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="kc-field">
          <div className="kc-input-wrap">
            <input
              id="confirmedPassword"
              name="confirmedPassword"
              type={isConfirmPasswordVisible ? "text" : "password"}
              className="kc-input kc-pill-input"
              placeholder="Confirm Password / បញ្ជាក់ពាក្យសម្ងាត់"
              value={confirmedPassword}
              onChange={(e) => {
                setConfirmedPassword(e.target.value);
                if (fieldErrors.confirmedPassword) {
                  setFieldErrors((prev) => ({
                    ...prev,
                    confirmedPassword: undefined,
                  }));
                }
              }}
              autoComplete="new-password"
              aria-invalid={!!fieldErrors.confirmedPassword}
            />
            <button
              type="button"
              className="kc-input-icon-btn"
              onClick={() => setIsConfirmPasswordVisible((prev) => !prev)}
              aria-label={
                isConfirmPasswordVisible
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
            >
              {isConfirmPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {fieldErrors.confirmedPassword && (
            <span className="kc-field-error">
              {fieldErrors.confirmedPassword}
            </span>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="kc-btn-primary kc-pill-btn"
        >
          {isLoading ? "កំពុងបង្កើតគណនី..." : "Register / បង្កើតគណនី"}
        </button>
      </form>

      {/* Footer */}
      <p className="kc-footer-text">
        មានគណនីរួចហើយ?{" "}
        <Link href="/api/auth/login" className="kc-link">
          ចូលគណនី
        </Link>
      </p>
    </AuthLayout>
  );
}
