import Link from "next/link";

export const metadata = { title: "Report · Kikumori" };

export default function ReportPage() {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-md px-5 py-12">
      <p className="text-xs uppercase tracking-[0.2em] text-[#e8b4b8]">
        Kikumori
      </p>
      <h1 className="mt-2 text-3xl font-semibold">Report</h1>
      <div className="mt-6 space-y-4 text-sm leading-7 text-[#cfc6b8]">
        <p>
          If this profile is impersonating someone, contains something illegal,
          or should not be listed, contact the site operator using the email
          published in your deployment environment.
        </p>
        <p>
          Do not send passwords, session tokens, or destination URLs in a
          report.
        </p>
      </div>
      <Link href="/" className="mt-10 inline-block text-sm text-[#f4d7c5]">
        ← Back to profile
      </Link>
    </main>
  );
}
