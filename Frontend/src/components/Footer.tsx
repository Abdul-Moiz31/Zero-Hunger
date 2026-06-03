import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Github, Twitter, Instagram, Mail, ArrowUpRight } from 'lucide-react';

const LINKS = {
  Platform: [
    { label: 'Browse food listings', href: '/listings' },
    { label: 'Public impact dashboard', href: '/impact' },
    { label: 'Sign in', href: '/auth' },
  ],
  'Get involved': [
    { label: 'Donate food', href: '/auth' },
    { label: 'Volunteer', href: '/auth' },
    { label: 'NGO partnership', href: '/auth' },
  ],
  Company: [
    { label: 'About us', href: '#about' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Contact', href: '#contact' },
  ],
};

const SOCIALS = [
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Mail, href: '#', label: 'Email' },
];

const Footer: React.FC = () => {
  const navigate = useNavigate();

  const handleLink = (href: string) => {
    if (href.startsWith('#')) document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    else navigate(href);
  };

  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-14">

        {/* Top row */}
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4 lg:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-4 lg:col-span-2">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2.5 rounded-xl transition hover:opacity-80"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-600">
                <Heart className="h-4.5 w-4.5 text-white" style={{ width: 18, height: 18 }} />
              </div>
              <span className="text-[15px] font-extrabold tracking-tight text-gray-900">Zero Hunger</span>
            </button>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-500">
              Connecting food donors, NGOs, and volunteers to rescue surplus food and feed communities
              in need — for free, always.
            </p>
            <div className="mt-6 flex gap-3">
              {SOCIALS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-400 transition hover:border-green-200 hover:bg-green-50 hover:text-green-600"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link groups */}
          {Object.entries(LINKS).map(([group, links]) => (
            <div key={group}>
              <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">{group}</h3>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <button
                      onClick={() => handleLink(href)}
                      className="group flex items-center gap-1 text-sm text-gray-600 transition hover:text-green-700"
                    >
                      {label}
                      {!href.startsWith('#') && !href.startsWith('/auth') && (
                        <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-6 sm:flex-row">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Zero Hunger. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 rounded-full border border-gray-100 bg-gray-50 px-4 py-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            <span className="text-xs text-gray-500">Platform running live</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
