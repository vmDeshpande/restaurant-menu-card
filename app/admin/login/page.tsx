import { LoginForm } from "../login-form";
import Link from "next/link";
import { ArrowUpRight, Utensils } from "lucide-react";

export default function Page() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f6f5f2] px-4 py-10">
      <div aria-hidden="true" className="absolute -left-28 -top-28 h-80 w-80 rounded-full border-[56px] border-amber-300/20" />
      <div aria-hidden="true" className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full border-[64px] border-charcoal-200/40" />
      <div className="relative grid w-full max-w-4xl overflow-hidden rounded-3xl border border-charcoal-200/70 bg-white shadow-lift md:grid-cols-[0.9fr_1.1fr]">
        <section className="relative flex min-h-56 flex-col justify-between overflow-hidden bg-charcoal-900 p-6 text-white sm:p-8 md:min-h-[540px]">
          <div aria-hidden="true" className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full border-[36px] border-amber-400/10" />
          <div className="relative flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400 text-sm font-black text-charcoal-900">SK</span>
            <span>
              <span className="block font-semibold tracking-tight">SSK Khau Galli</span>
              <span className="text-xs text-charcoal-400">Restaurant workspace</span>
            </span>
          </div>
          <div className="relative mt-10">
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-amber-300">
              <Utensils aria-hidden="true" className="h-5 w-5" />
            </span>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Welcome back</p>
            <h1 className="mt-3 max-w-sm font-serif text-3xl font-semibold leading-tight sm:text-4xl">Your menu, thoughtfully managed.</h1>
            <p className="mt-3 max-w-sm text-sm leading-6 text-charcoal-300">Sign in to manage dishes, categories, and restaurant details.</p>
          </div>
          <Link href="/" className="relative mt-8 inline-flex min-h-10 w-fit items-center gap-2 text-sm font-medium text-charcoal-300 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300">
            Back to public menu <ArrowUpRight aria-hidden="true" className="h-4 w-4 text-amber-300" />
          </Link>
        </section>
        <section className="flex items-center px-6 py-8 sm:px-10 md:px-12">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-7">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-700">Admin sign in</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-charcoal-900">Welcome back</h2>
              <p className="mt-1 text-sm text-charcoal-500">Enter your administrator credentials to continue.</p>
            </div>
            <LoginForm />
            <p className="mt-6 text-center text-xs leading-5 text-charcoal-400">This area is restricted to authorized administrators.</p>
          </div>
        </section>
      </div>
    </main>
  );
}