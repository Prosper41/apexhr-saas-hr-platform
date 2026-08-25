"use client";

import { Button } from "@/components/ui/button";
import { Fraunces, Manrope } from "next/font/google";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
});

const FEATURES = [
  {
    label: "Personal",
    title: "Employee profiles",
    description:
      "Keep every important detail in one place — from contact info to documents that matter.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.1}
      >
        <circle cx="12" cy="8" r="3.4" />
        <path d="M5 20c1-4 3.8-6 7-6s6 2 7 6" />
      </svg>
    ),
  },
  {
    label: "Organization",
    title: "Team structure",
    description: "See your teams clearly and stay aligned.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.1}
      >
        <circle cx="12" cy="5" r="2.2" />
        <circle cx="6" cy="18" r="2.2" />
        <circle cx="18" cy="18" r="2.2" />
        <path d="M12 7.2V12M12 12L6.8 16.2M12 12L17.2 16.2" />
      </svg>
    ),
  },
  {
    label: "Time off",
    title: "Leave management",
    description:
      "Simplify requests, track balances, and keep operations running smoothly.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.1}
      >
        <path d="M7 3.5v4M7 20.5v-4M7 7.5c3 2 7 2 10 0M7 16.5c3-2 7-2 10 0M17 3.5v17" />
      </svg>
    ),
  },
  {
    label: "Process",
    title: "Approval workflows",
    description:
      "Every request finds the right person automatically. Nothing chased, nothing missed.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.1}
      >
        <path d="M4 12.5l5.2 5.5L20 6" />
      </svg>
    ),
  },
  {
    label: "Awareness",
    title: "Instant notifications",
    description:
      "The moment something needs attention, the right person hears about it.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.1}
      >
        <path d="M12 4c-3 0-5 2.3-5 5.5v3L5 16h14l-2-3.5v-3C17 6.3 15 4 12 4z" />
        <path d="M10 18.5a2 2 0 004 0" />
      </svg>
    ),
  },
];

const SWIPE_THRESHOLD = 90;

function FeatureCardStack() {
  const [order, setOrder] = useState(FEATURES.map((_, i) => i));
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const pointerId = useRef<number | null>(null);

  const advance = (dir: 1 | -1) => {
    setOrder((prev) => {
      const next = [...prev];
      if (dir === 1) {
        next.push(next.shift() as number);
      } else {
        next.unshift(next.pop() as number);
      }
      return next;
    });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    pointerId.current = e.pointerId;
    startX.current = e.clientX;
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || pointerId.current !== e.pointerId) return;
    setDragX(e.clientX - startX.current);
  };

  const endDrag = () => {
    if (Math.abs(dragX) > SWIPE_THRESHOLD) {
      advance(dragX < 0 ? 1 : -1);
    }
    setDragging(false);
    setDragX(0);
    pointerId.current = null;
  };

  const prevIdx = order[order.length - 1];
  const currIdx = order[0];
  const nextIdx = order[1];

  const renderCard = (
    featureIdx: number,
    variant: "prev" | "current" | "next",
  ) => {
    const f = FEATURES[featureIdx];
    const isCurrent = variant === "current";

    let transform = "translateX(-50%)";
    if (variant === "prev") transform = "translateX(calc(-50% - 400px))";
    if (variant === "next") transform = "translateX(calc(-50% + 400px))";
    if (isCurrent) {
      const dragRotate = dragX / 22;
      transform = `translateX(calc(-50% + ${dragX}px)) rotate(${dragRotate}deg)`;
    }

    return (
      <div
        key={variant}
        onPointerDown={isCurrent ? onPointerDown : undefined}
        onPointerMove={isCurrent ? onPointerMove : undefined}
        onPointerUp={isCurrent ? endDrag : undefined}
        onPointerCancel={isCurrent ? endDrag : undefined}
        className={`absolute top-0 flex h-full flex-col justify-between rounded-2xl border border-[#ab8853]/35 bg-[#fffcf5] p-8 shadow-[0_18px_40px_-16px_rgba(21,22,26,0.25)] ${
          isCurrent ? "w-[320px] sm:w-[400px]" : "w-[300px] sm:w-[360px]"
        }`}
        style={{
          left: "50%",
          transform,
          zIndex: isCurrent ? 20 : 10,
          opacity: isCurrent ? 1 : 0.4,
          transition:
            isCurrent && dragging
              ? "none"
              : "transform 0.45s cubic-bezier(0.22,1,0.36,1), opacity 0.45s",
          cursor: isCurrent ? (dragging ? "grabbing" : "grab") : "default",
          pointerEvents: isCurrent ? "auto" : "none",
          touchAction: "none",
        }}
      >
        <div>
          <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-full border border-[#ab8853]/50 bg-[#ab8853]/10 text-[#ab8853]">
            <span className="h-6 w-6">{f.icon}</span>
          </div>
          <span className="mb-2 block text-[10.5px] font-semibold tracking-[0.2em] text-[#ab8853] uppercase">
            {f.label}
          </span>
          <h3 className="mb-3 font-[family-name:var(--font-fraunces)] text-[26px] font-medium text-[#15161a]">
            {f.title}
          </h3>
          <p className="text-[15px] leading-relaxed text-[#8b8579]">
            {f.description}
          </p>
        </div>

        {isCurrent && (
          <button
            onClick={() => advance(1)}
            className="flex items-center gap-1.5 self-start text-[13px] font-semibold text-[#ab8853] transition-colors hover:text-[#8b6a3d]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              className="h-3.5 w-3.5"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[380px] w-full overflow-hidden">
        {renderCard(prevIdx, "prev")}
        {renderCard(nextIdx, "next")}
        {renderCard(currIdx, "current")}
      </div>

      {/* Controls */}
      <div className="mt-8 flex items-center gap-6">
        <button
          aria-label="Previous feature"
          onClick={() => advance(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#15161a]/15 text-[#15161a] transition-colors hover:border-[#ab8853] hover:text-[#ab8853]"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="h-4 w-4"
          >
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>

        <div className="flex gap-2">
          {FEATURES.map((_, i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full transition-colors"
              style={{
                backgroundColor:
                  order[0] === i ? "#ab8853" : "rgba(21,22,26,0.15)",
              }}
            />
          ))}
        </div>

        <button
          aria-label="Next feature"
          onClick={() => advance(1)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#15161a]/15 text-[#15161a] transition-colors hover:border-[#ab8853] hover:text-[#ab8853]"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="h-4 w-4"
          >
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`${fraunces.variable} ${manrope.variable} flex min-h-screen flex-col bg-[#f7f3ea] font-[family-name:var(--font-manrope)] text-[#15161a]`}
    >
      {/* NAV  */}
      <header
        className={`fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-6 py-5 transition-all duration-300 md:px-16 ${
          scrolled
            ? "border-b border-black/5 bg-[#f7f3ea]/95 py-4 shadow-[0_2px_16px_-4px_rgba(21,22,26,0.08)] backdrop-blur-sm"
            : "border-b border-transparent bg-transparent py-7"
        }`}
      >
        <Link href="/">
          <span
            className={`font-[family-name:var(--font-fraunces)] text-xl font-medium transition-colors duration-300 ${
              scrolled ? "text-[#15161a]" : "text-[#f7f3ea]"
            }`}
          >
            Apex<span className="text-[#ab8853]">HR</span>
          </span>
        </Link>
        <Link href="/register-tenant">
          <Button
            size="sm"
            variant="outline"
            className={`rounded-sm px-6 text-xs font-semibold tracking-wider uppercase transition-colors duration-300 ${
              scrolled
                ? "border-[#15161a]/25 bg-transparent text-[#15161a] hover:bg-[#15161a] hover:text-[#f7f3ea]"
                : "border-white/40 bg-transparent text-[#f7f3ea] hover:bg-[#f7f3ea] hover:text-[#15161a]"
            }`}
          >
            Register a Company
          </Button>
        </Link>
      </header>

      {/* HERO  */}
      <section className="relative h-screen min-h-[680px] overflow-hidden bg-[#0d0d0e]">
        <div className="grid h-full grid-cols-1 md:grid-cols-2">
          {/* Text panel */}
          <div className="relative z-10 order-2 flex flex-col justify-center px-6 py-14 md:order-1 md:px-16 md:py-0">
            <span className="mb-5 inline-block border-[#ab8853]/50 pb-2 text-[11px] font-semibold tracking-[0.22em] text-[#ab8853] uppercase">
              Time, cared for
            </span>

            <h1
              className="mb-6 max-w-lg font-[family-name:var(--font-fraunces)] font-medium text-[#f7f3ea]"
              style={{
                fontSize: "clamp(1.1rem, 2.4vw, 1.6rem)",
                lineHeight: 1.25,
              }}
            >
              Your team&apos;s time matters. ApexHR keeps employee profiles,
              teams, and leave organized in one place, making it easy to manage
              work and keep everything on track.
            </h1>

            <div className="flex flex-wrap gap-3.5">
              <Link href="/signup">
                <Button className="h-auto rounded-sm border-none bg-[#ab8853] px-8 py-4 text-xs font-semibold tracking-wider text-[#15161a] uppercase hover:bg-[#d8c39a]">
                  Get started free
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  className="h-auto rounded-sm border-white/40 bg-transparent px-8 py-4 text-xs font-semibold tracking-wider text-[#f7f3ea] uppercase hover:bg-[#f7f3ea] hover:text-[#15161a]"
                >
                  Sign in
                </Button>
              </Link>
            </div>
          </div>

          {/* Video panel */}
          <div className="relative order-1 h-[280px] sm:h-[360px] md:order-2 md:h-full">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 h-full w-full object-cover [filter:saturate(1.05)_contrast(1.05)_brightness(1.15)]"
            >
              <source src="/hourglass.mp4" type="video/mp4" />
            </video>
            {/* Soft seam so the video's black backdrop blends into the panel beside it */}
            <div
              className="absolute inset-0 hidden md:block"
              style={{
                background:
                  "linear-gradient(90deg, rgba(21,22,26,0.9) 0%, rgba(21,22,26,0) 12%)",
              }}
            />
            <div
              className="absolute inset-0 md:hidden"
              style={{
                background:
                  "linear-gradient(180deg, rgba(21,22,26,0.85) 0%, rgba(21,22,26,0) 18%, rgba(21,22,26,0) 82%, rgba(21,22,26,0.85) 100%)",
              }}
            />
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="mx-auto max-w-3xl px-6 py-20 text-center md:py-28">
        <span className="text-[11px] font-semibold tracking-[0.22em] text-[#ab8853] uppercase">
          The practice
        </span>
        <h2
          className="mx-auto mt-5 font-[family-name:var(--font-fraunces)] font-medium"
          style={{ fontSize: "clamp(1.8rem, 3.4vw, 2.6rem)", lineHeight: 1.25 }}
        >
          <span className="text-[#ab8853]">HR should feel effortless.</span>{" "}
          <span className="text-[#15161a]">
            ApexHR keeps your people, time, and leave in order so your team can
            focus on the work that matters.
          </span>
        </h2>
      </section>

      {/* FEATURES — swipeable card stack */}
      <section className="mx-auto w-full max-w-5xl px-6 pb-28 md:pb-36">
        <div className="mb-14 flex items-end justify-between border-[#ab8853]/30 pb-6 md:mb-16">
          <span className="font-[family-name:var(--font-fraunces)] text-sm text-[#8b8579] italic">
            What&apos;s inside
          </span>
          <span className="text-[11px] font-semibold tracking-[0.22em] text-[#ab8853] uppercase">
            Five essentials
          </span>
        </div>

        <FeatureCardStack />
      </section>

      {/* CLOSING */}
      <section className="grid min-h-[60vh] grid-cols-1 bg-[#15161a] text-[#f7f3ea] md:grid-cols-2">
        <div className="flex flex-col justify-center px-6 py-16 md:px-16">
          <span className="mb-5 text-[11px] font-semibold tracking-[0.22em] text-[#ab8853] uppercase">
            Ready when you are
          </span>
          <h2
            className="mb-5 font-[family-name:var(--font-fraunces)] font-medium"
            style={{ fontSize: "clamp(2rem, 3.6vw, 3.1rem)", lineHeight: 1.15 }}
          >
            Give your people back their time.
          </h2>
          <p className="mb-8 max-w-sm text-[15.5px] leading-relaxed text-[#f7f3ea]/65">
            Set up ApexHR for your company in minutes. No spreadsheets, no
            chasing, no sand left ungathered.
          </p>
          <div className="flex flex-wrap gap-3.5">
            <Link href="/register-tenant">
              <Button className="h-auto rounded-sm border-none bg-[#ab8853] px-8 py-4 text-xs font-semibold tracking-wider text-[#15161a] uppercase hover:bg-[#d8c39a]">
                Register a company
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="outline"
                className="h-auto rounded-sm border-white/35 bg-transparent px-8 py-4 text-xs font-semibold tracking-wider text-[#f7f3ea] uppercase hover:border-white hover:bg-white/10"
              >
                Talk to us
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex min-h-[280px] items-center justify-center border-t border-white/10 py-12 md:min-h-full md:border-t-0 md:border-l">
          <div className="h-56 w-56 overflow-hidden rounded-full border border-[#ab8853]/50">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover [filter:saturate(0.9)]"
            >
              <source src="/hourglass.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-[#15161a] px-6 py-6 md:px-16">
        <span className="font-[family-name:var(--font-fraunces)] text-[15px] text-[#f7f3ea]">
          Apex<span className="text-[#d8c39a]">HR</span>
        </span>
        <span className="text-xs text-[#f7f3ea]/45">
          © 2026 ApexHR. All rights reserved.
        </span>
      </footer>
    </div>
  );
}
