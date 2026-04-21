"use client";

type LandingMarqueeProps = {
  items: string[];
};

export function LandingMarquee({ items }: LandingMarqueeProps) {
  const segment = items.join(" · ");
  const line = `${segment} · `.repeat(8);

  return (
    <div className="df-marquee border-y border-white/[0.08] bg-[#050505] py-5">
      <div className="df-marquee-track flex w-max">
        <div className="shrink-0 pr-20">
          <span className="inline-block whitespace-nowrap font-[family-name:var(--font-heading-display)] text-[clamp(0.75rem,1.6vw,0.95rem)] font-medium uppercase tracking-[0.35em] text-white/35">
            {line}
          </span>
        </div>
        <div className="shrink-0 pr-20" aria-hidden>
          <span className="inline-block whitespace-nowrap font-[family-name:var(--font-heading-display)] text-[clamp(0.75rem,1.6vw,0.95rem)] font-medium uppercase tracking-[0.35em] text-white/35">
            {line}
          </span>
        </div>
      </div>
    </div>
  );
}
