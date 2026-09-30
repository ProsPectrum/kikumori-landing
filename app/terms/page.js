import Link from "next/link";

export const metadata = { title: "Terms · Kikumori" };

export default function TermsPage() {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-md px-5 py-12">
      <p className="text-xs uppercase tracking-[0.2em] text-[#e8b4b8]">
        Kikumori
      </p>
      <h1 className="mt-2 text-3xl font-semibold">Terms</h1>
      <div className="mt-6 space-y-4 text-sm leading-7 text-[#cfc6b8]">
        <p>
          This website provides public social links and one age-gated exclusive
          destination. You must be 18 or older to continue to exclusive content.
        </p>
        <p>
          Social destinations are public third-party sites. Exclusive access is
          granted only after a successful human verification step.
        </p>
      </div>
      <Link href="/" className="mt-10 inline-block text-sm text-[#f4d7c5]">
        ← Back to profile
      </Link>
    </main>
  );
}
