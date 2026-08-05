import Link from "next/link";

export default function GroupVotePage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16 sm:px-6">
      <section className="mx-auto w-full max-w-2xl rounded-[26px] border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-10">
        <h1 className="text-[26px] font-bold text-primary-900 sm:text-[32px]">
          ការបោះឆ្នោតជ្រើសរើសហាង
        </h1>

        <p className="mx-auto mt-3 max-w-xl text-[16px] leading-7 text-slate-500">
          សូមបើកតំណដែលមានលេខកូដអញ្ជើញរបស់ក្រុម ដើម្បីចូលរួមបោះឆ្នោតជ្រើសរើសហាង។
        </p>

        <Link
          href="/food"
          className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-primary-800 px-6 text-[16px] font-bold text-white transition hover:bg-primary-700"
        >
          ត្រឡប់ទៅទំព័រអាហារ
        </Link>
      </section>
    </main>
  );
}
