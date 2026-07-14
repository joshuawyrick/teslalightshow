import { Shield, Clock, Cloud, Heart } from 'lucide-react';

const linkGroups = [
  {
    title: 'Create',
    links: [
      { label: 'Light Show Generator', href: '/tesla-light-show-generator#upload' },
      { label: 'Custom Light Shows', href: '/custom-tesla-light-show' },
      { label: 'Download Light Shows', href: '/tesla-light-show-downloads' },
      { label: 'Gallery', href: '/tesla-light-show-gallery' },
    ],
  },
  {
    title: 'Guides',
    links: [
      { label: 'How to Add Light Show', href: '/how-to-add-custom-light-show-to-tesla' },
      { label: 'USB Setup Guide', href: '/tesla-light-show-usb-setup' },
      { label: 'Troubleshooting', href: '/tesla-light-show-not-working' },
      { label: 'Best Software', href: '/best-tesla-light-show-software' },
    ],
  },
  {
    title: 'Models',
    links: [
      { label: 'Model Y', href: '/tesla-model-y-light-show' },
      { label: 'Model 3', href: '/tesla-model-3-light-show' },
      { label: 'Cybertruck', href: '/cybertruck-light-show' },
      { label: 'Model S / Model X', href: '/tesla-model-s-model-x-light-show' },
    ],
  },
  {
    title: 'Occasions',
    links: [
      { label: 'Halloween', href: '/tesla-halloween-light-show' },
      { label: 'Christmas', href: '/tesla-christmas-light-show' },
      { label: 'Birthday', href: '/tesla-birthday-light-show' },
      { label: 'New Year', href: '/tesla-new-year-light-show' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'FAQ', href: '/tesla-light-show-faq' },
      { label: 'Support', href: '/support' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Refund Policy', href: '/refund-policy' },
      { label: 'Copyright Policy', href: '/copyright-music-upload-policy' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border mt-8 sm:mt-12">
      {/* Trust icons row */}
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-electric-cyan/10 border border-electric-cyan/20 flex items-center justify-center shrink-0">
              <Shield size={14} className="text-electric-cyan" />
            </div>
            <div>
              <p className="text-text-primary text-xs sm:text-sm font-medium">Trusted &amp; Secure</p>
              <p className="text-text-secondary text-[10px] sm:text-xs hidden sm:block">Your data is private and safe.</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-electric-cyan/10 border border-electric-cyan/20 flex items-center justify-center shrink-0">
              <Clock size={14} className="text-electric-cyan" />
            </div>
            <div>
              <p className="text-text-primary text-xs sm:text-sm font-medium">Lightning Fast</p>
              <p className="text-text-secondary text-[10px] sm:text-xs hidden sm:block">Shows generated in seconds.</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-electric-cyan/10 border border-electric-cyan/20 flex items-center justify-center shrink-0">
              <Cloud size={14} className="text-electric-cyan" />
            </div>
            <div>
              <p className="text-text-primary text-xs sm:text-sm font-medium">Cloud Powered</p>
              <p className="text-text-secondary text-[10px] sm:text-xs hidden sm:block">Access anywhere, anytime.</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-electric-cyan/10 border border-electric-cyan/20 flex items-center justify-center shrink-0">
              <Heart size={14} className="text-electric-cyan" />
            </div>
            <div>
              <p className="text-text-primary text-xs sm:text-sm font-medium">Independent Service</p>
              <p className="text-text-secondary text-[10px] sm:text-xs hidden sm:block">Built for Tesla enthusiasts.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Link groups */}
      <div className="border-t border-border">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 sm:gap-6">
            {linkGroups.map(group => (
              <div key={group.title} className="space-y-3">
                <p className="text-text-primary text-xs font-semibold uppercase tracking-wider">{group.title}</p>
                <ul className="space-y-2">
                  {group.links.map(link => (
                    <li key={link.href}>
                      <a href={link.href} className="text-text-secondary/80 hover:text-text-primary text-xs transition-colors duration-150">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fine print */}
      <div className="border-t border-border py-6 sm:py-8 px-4 sm:px-6">
        <div className="max-w-[1320px] mx-auto flex flex-col items-center gap-5">
          <img src="/logo.webp" alt="EV Light Shows" width={234} height={36} className="h-9 w-auto" />
          <p className="text-text-secondary/80 text-[10px] sm:text-xs text-center leading-relaxed max-w-3xl">
            EV Light Shows is not affiliated with, endorsed by, or sponsored by Tesla, Inc. Tesla and its model names are trademarks of Tesla, Inc., used here only to describe product compatibility.
          </p>
          <p className="text-text-secondary/80 text-[10px] sm:text-xs text-center leading-relaxed">
            EVLightShows.com is an independent digital service and is not affiliated with, endorsed by, sponsored by, or approved by Tesla, Inc. Tesla and related vehicle names are trademarks of Tesla, Inc. References to Tesla are used only to describe compatibility and intended file use.
          </p>
          <p className="text-text-secondary/80 text-[10px] sm:text-xs text-center leading-relaxed">
            EVLightShows.com is operated by a California-based sole proprietor. California, United States | support@evlightshows.com
          </p>
          <p className="text-text-secondary/70 text-[10px] text-center">
            &copy; {new Date().getFullYear()} EVLightShows.com. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
