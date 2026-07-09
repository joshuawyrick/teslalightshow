import { ReactNode } from 'react';

interface AnswerBoxProps {
  children: ReactNode;
}

export function AnswerBox({ children }: AnswerBoxProps) {
  return (
    <div className="bg-electric-cyan/5 border border-electric-cyan/20 rounded-xl p-4 sm:p-5">
      <p className="text-text-primary text-sm sm:text-base leading-relaxed">{children}</p>
    </div>
  );
}

interface CTASectionProps {
  headline: string;
  text: string;
  buttonText: string;
  href: string;
  secondary?: { text: string; href: string };
}

export function CTASection({ headline, text, buttonText, href, secondary }: CTASectionProps) {
  return (
    <div className="bg-charcoal border border-border rounded-2xl p-6 sm:p-8 text-center space-y-4">
      <h3 className="text-text-primary text-lg sm:text-xl font-display font-bold">{headline}</h3>
      <p className="text-text-secondary text-sm leading-relaxed max-w-lg mx-auto">{text}</p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <a href={href} className="inline-flex items-center gap-2 bg-accent-red hover:bg-accent-red/90 text-white text-sm font-semibold rounded-xl px-6 py-3 transition-all glow-red">
          {buttonText}
        </a>
        {secondary && (
          <a href={secondary.href} className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors">
            {secondary.text}
          </a>
        )}
      </div>
    </div>
  );
}

interface StepProps {
  number: string;
  title: string;
  text: string;
}

export function StepGuide({ steps }: { steps: StepProps[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {steps.map(step => (
        <div key={step.number} className="bg-charcoal border border-border rounded-xl p-4 sm:p-5 space-y-2">
          <div className="w-7 h-7 rounded-lg bg-electric-cyan/15 border border-electric-cyan/25 text-electric-cyan font-bold text-xs flex items-center justify-center">
            {step.number}
          </div>
          <h3 className="text-text-primary text-sm font-semibold">{step.title}</h3>
          <p className="text-text-secondary text-xs leading-relaxed">{step.text}</p>
        </div>
      ))}
    </div>
  );
}

interface FaqItem {
  q: string;
  a: string;
}

export function FaqAccordion({ items, id }: { items: FaqItem[]; id?: string }) {
  return (
    <div className="space-y-3" id={id}>
      {items.map((item, i) => (
        <details key={i} className="group bg-steel/50 border border-border rounded-xl overflow-hidden">
          <summary className="flex items-center justify-between gap-3 px-4 sm:px-5 py-4 cursor-pointer select-none hover:bg-steel transition-colors">
            <span className="text-text-primary text-sm font-medium">{item.q}</span>
            <span className="text-text-secondary text-xs shrink-0 group-open:rotate-180 transition-transform duration-200">&#9660;</span>
          </summary>
          <div className="px-4 sm:px-5 pb-4">
            <p className="text-text-secondary text-sm leading-relaxed">{item.a}</p>
          </div>
        </details>
      ))}
    </div>
  );
}

interface ComparisonRow {
  feature: string;
  col1: string;
  col2: string;
}

export function ComparisonTable({ headers, rows }: { headers: [string, string, string]; rows: ComparisonRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border border-border rounded-xl overflow-hidden">
        <thead>
          <tr className="bg-charcoal">
            <th className="text-left text-text-secondary font-medium px-4 py-3 border-b border-border">{headers[0]}</th>
            <th className="text-left text-text-secondary font-medium px-4 py-3 border-b border-border">{headers[1]}</th>
            <th className="text-left text-text-secondary font-medium px-4 py-3 border-b border-border">{headers[2]}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-steel/30' : 'bg-charcoal/30'}>
              <td className="text-text-primary px-4 py-3 border-b border-border/50">{row.feature}</td>
              <td className="text-text-secondary px-4 py-3 border-b border-border/50">{row.col1}</td>
              <td className="text-text-secondary px-4 py-3 border-b border-border/50">{row.col2}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface InternalLink {
  label: string;
  href: string;
  desc?: string;
}

export function InternalLinkGrid({ title, links }: { title: string; links: InternalLink[] }) {
  return (
    <div className="space-y-4">
      {title && <h2 className="text-lg font-display font-bold text-text-primary">{title}</h2>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {links.map(link => (
          <a
            key={link.href}
            href={link.href}
            className="bg-charcoal border border-border rounded-xl p-4 hover:border-electric-cyan/30 transition-all duration-200 group"
          >
            <p className="text-text-primary text-sm font-medium group-hover:text-electric-cyan transition-colors">{link.label}</p>
            {link.desc && <p className="text-text-secondary text-xs mt-1">{link.desc}</p>}
          </a>
        ))}
      </div>
    </div>
  );
}

export function IndependentNotice() {
  return (
    <div className="border border-border rounded-xl p-4 sm:p-5 bg-charcoal/50">
      <p className="text-text-secondary text-xs leading-relaxed">
        TeslaLightShows.com is an independent digital service and is not affiliated with, endorsed by, sponsored by, or approved by Tesla, Inc. Tesla, Model S, Model 3, Model X, Model Y, Cybertruck, and related marks are trademarks of Tesla, Inc. References are used only to describe vehicle compatibility and user-created light show files.
      </p>
    </div>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs text-text-secondary/60">
      {items.map((item, i) => (
        <span key={i}>
          {i > 0 && <span className="mx-1.5">/</span>}
          {item.href ? (
            <a href={item.href} className="hover:text-text-primary transition-colors">{item.label}</a>
          ) : (
            <span className="text-text-secondary">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
