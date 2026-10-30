
import Link from "next/link";
import type { ReactNode } from "react";

type AuthLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
};

const features = [
  "Manage campus complaints",
  "Monitor resolution progress",
  "Manage staff and departments",
];

export default function AuthLayout({
  title,
  description,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side: Red Admin Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[radial-gradient(ellipse_at_40%_5%,#fca5a5_0%,#ef4444_22%,#b91c1c_45%,#450a0a_70%,#020617_100%)] overflow-hidden">

        {/* Top Logo */}
        <Link href="/" className="cursor-pointer">
          <div className="absolute top-6 left-8 z-10 flex items-center gap-3">
            

            <div>
              <h1 className="text-xl font-bold font-poppins text-white tracking-tight">
                SaySo
              </h1>
              <p className="text-xs tracking-[0.2em] text-white/65 uppercase">
                Administration
              </p>
            </div>
          </div>
        </Link>

        {/* Center Branding Content */}
        <div className="absolute inset-0 flex items-center justify-center p-8 pt-28 xl:p-12">
          <div className="mx-auto w-full max-w-md">

            <div className="mb-4 flex justify-center">
              <span className="rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wider text-white/90 uppercase">
                Admin Control Center
              </span>
            </div>

            <h2 className="text-center text-4xl font-semibold tracking-tight text-white xl:text-5xl">
              Manage SaySo
            </h2>

            <p className="mx-auto mt-4 max-w-sm text-center text-xs leading-7 text-white/80">
              Everything your campus needs, managed from one place.
            </p>

            {/* Vertically Scrolling Cards */}
            <div
              className="relative mt-8 h-[230px] overflow-hidden"
              style={{
                maskImage:
                  "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)",
              }}
            >
              <div className="animate-scroll-up flex flex-col">
                {[0, 1].map((group) => (
                  <div
                    key={group}
                    aria-hidden={group === 1}
                    className="flex shrink-0 flex-col gap-3 pb-3"
                  >
                    {features.map((item, index) => (
                      <div
                        key={`${group}-${item}`}
                        className={`flex items-center gap-4 rounded-xl px-5 py-4 ${
                          index === 0
                            ? "bg-white text-slate-950"
                            : "border border-white/15 bg-slate-950/30 text-white backdrop-blur-sm"
                        }`}
                      >
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                            index === 0
                              ? "bg-red-600 text-white"
                              : "bg-white/15 text-white"
                          }`}
                        >
                          {index + 1}
                        </span>

                        <span className="text-sm font-medium">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-white/65">
              One campus. One platform. Better management.
            </p>
          </div>
        </div>

        {/* Bottom Quote */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-sm text-left">
            <svg
              className="mb-3 h-8 w-8 text-red-200"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>

            <blockquote className="text-xs italic leading-relaxed font-medium text-white/95">
              "Strong administration builds a better campus. Every issue
              deserves attention, and every solution creates progress."
            </blockquote>

            <p className="mt-3 text-sm font-semibold text-red-200">
              CampusX Administration
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Form Area */}
      <div className="flex min-h-screen w-full items-center justify-center px-6 py-10 sm:px-10 lg:w-1/2">
        <div className="w-full max-w-[410px]">

          {/* Mobile Logo */}
          <Link
            href="/"
            className="mb-10 flex items-center justify-center gap-3 lg:hidden"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-red-500 font-bold text-red-500">
              C
            </div>

            <div>
              <h1 className="text-xl font-bold">CampusX Admin</h1>
              <p className="text-xs text-muted-foreground">
                Administration Portal
              </p>
            </div>
          </Link>

          {/* Form Heading */}
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-semibold tracking-tight">
              {title}
            </h2>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>

          {children}

          {/* Form Footer */}
          <div className="relative z-20 mt-4 text-center text-sm">
            {footer}
          </div>
        </div>
      </div>
    </div>
  );
}
