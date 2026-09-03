"use client";

import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";
import { AlertCircleIcon, GoogleIcon } from "@/components/auth/icons";

function safeReturnTo(value: string | null | undefined, fallback = "/"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }
  return value;
}

function formatErrorMessage(error: string | null, description: string | null): string {
  if (!error) return "";
  if (error === "invalid_state") {
    return "ការផ្ទៀងផ្ទាត់សុពលភាពបានផុតកំណត់ ឬមិនត្រឹមត្រូវ។ សូមព្យាយាមចូលគណនីម្តងទៀត។ (Session expired. Please sign in again.)";
  }
  if (error === "missing_code") {
    return "មិនទទួលបានលេខកូដអនុញ្ញាតពី Keycloak ទេ។ (Missing authorization code.)";
  }
  if (error === "keycloak_connection_failed") {
    return "មិនអាចភ្ជាប់ទៅកាន់ម៉ាស៊ីនបម្រើ Keycloak បានទេ។ (Could not communicate with authentication server.)";
  }
  return description || error || "ការចូលគណនីមិនបានជោគជ័យទេ។ សូមព្យាយាមម្តងទៀត។";
}

export default function LoginClient() {
  const searchParams = useSearchParams();

  const returnTo = safeReturnTo(searchParams.get("returnTo"), "/");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const loginUrl = `/api/auth/login?returnTo=${encodeURIComponent(returnTo)}`;

  // Auto-redirect to Keycloak when visiting /login without errors
  useEffect(() => {
    if (!error) {
      window.location.replace(loginUrl);
    }
  }, [error, loginUrl]);

  return (
    <AuthLayout>
      <div className="kc-login-header-group">
        <h1 className="kc-title">ចូលទៅកាន់គណនី ម្ហូបអាហារ</h1>
        <p className="kc-subtitle">
          រីករាយដែលជួបអ្នកម្ដងទៀត។ តោះយើងរកអ្វីដែលឆ្ងាញ់ៗញាំ
        </p>
      </div>

      {error ? (
        <div className="space-y-5">
          <div className="kc-alert kc-alert-error" role="alert">
            <AlertCircleIcon className="shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-0.5">ការចូលគណនីបរាជ័យ (Login Failed)</p>
              <p className="text-xs sm:text-sm">
                {formatErrorMessage(error, errorDescription)}
              </p>
            </div>
          </div>

          <a
            href={loginUrl}
            className="kc-btn-primary kc-pill-btn"
          >
            ព្យាយាមចូលគណនីម្តងទៀត / Login Again
          </a>

          <div className="kc-divider">
            <span>ឬចូលគណនីជាមួយ</span>
          </div>

          <div className="kc-social-row">
            <a
              href="/api/auth/login?kc_idp_hint=google"
              className="kc-pill-social-btn"
              id="social-google"
            >
              <GoogleIcon />
              <span>Google</span>
            </a>
          </div>

          <p className="kc-footer-text">
            មិនទាន់មានគណនីមែនទេ?{" "}
            <Link href="/register" className="kc-link">
              បង្កើតគណនី
            </Link>
          </p>
        </div>
      ) : (
        <div className="py-12 flex flex-col items-center justify-center text-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-[#84cc16] border-t-transparent" />
          <p className="text-base font-semibold text-slate-700 dark:text-slate-200">
            កំពុងបញ្ជូនទៅកាន់ទំព័រចូលគណនី...
          </p>
          <p className="text-xs text-slate-500">
            Redirecting to secure login...
          </p>
        </div>
      )}
    </AuthLayout>
  );
}