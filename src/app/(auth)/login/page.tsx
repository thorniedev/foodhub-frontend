// "use client";

// import Link from "next/link";
// import { useState } from "react";
// import { useSearchParams } from "next/navigation";

// export default function LoginPage() {
//   const searchParams = useSearchParams();
//   const returnTo = searchParams.get("returnTo") ?? "/dashboard";
//   const [isRedirecting, setIsRedirecting] = useState(false);

//   const handleLogin = () => {
//     setIsRedirecting(true);
//     window.location.assign(
//       `/api/auth/login?returnTo=${encodeURIComponent(returnTo)}`,
//     );
//   };

//   return (
//     <main className="flex min-h-screen items-center justify-center px-4 py-10">
//       <section className="w-full max-w-md rounded-3xl border bg-background p-6 shadow-sm sm:p-8">
//         <div className="mb-8 text-center">
//           <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
//             FoodHub
//           </p>
//           <p className="mt-3 text-3xl font-bold tracking-tight">
//             Sign in to your account
//           </p>
//           <p className="mt-2 text-sm text-muted-foreground">
//             Continue with your Keycloak-powered FoodHub session.
//           </p>
//         </div>

//         <div className="space-y-4">
//           <button
//             type="button"
//             onClick={handleLogin}
//             disabled={isRedirecting}
//             className="w-full rounded-xl bg-primary px-5 py-3.5 text-base font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
//           >
//             {isRedirecting
//               ? "Redirecting to Keycloak..."
//               : "Continue with Keycloak"}
//           </button>

//           <div className="text-center text-sm text-muted-foreground">
//             Don&apos;t have an account?{" "}
//             <Link
//               href="/register"
//               className="font-semibold text-primary underline-offset-4 hover:underline"
//             >
//               Create one
//             </Link>
//           </div>
//         </div>
//       </section>
//     </main>
//   );
// }
import LoginClient from "./LoginClient";

type LoginPageProps = {
  searchParams: Promise<{
    returnTo?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  const returnTo = params.returnTo ?? "/dashboard";

  return <LoginClient returnTo={returnTo} />;
}
