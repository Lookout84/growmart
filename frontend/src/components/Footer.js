import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const FALLBACK_SECTIONS = [
  {
    id: 'f1', title: 'Про компанію',
    links: [
      { id: 1, label: 'Про нас', url: '/about' },
      { id: 2, label: 'Наші переваги', url: '/advantages' },
      { id: 3, label: 'Відгуки', url: '/reviews' },
    ],
  },
  {
    id: 'f2', title: 'Покупцям',
    links: [
      { id: 4, label: 'Оплата і доставка', url: '/delivery' },
      { id: 5, label: 'Гарантії', url: '/guarantees' },
      { id: 6, label: 'Повернення', url: '/returns' },
      { id: 7, label: 'Питання та відповіді', url: '/faq' },
    ],
  },
  {
    id: 'f3', title: 'Каталог',
    links: [
      { id: 8, label: 'Полуниця', url: '/products?category=polunycja' },
      { id: 9, label: 'Малина', url: '/products?category=malyna' },
      { id: 10, label: 'Смородина', url: '/products?category=smorodyna' },
      { id: 11, label: 'Агрус', url: '/products?category=ahrus' },
    ],
  },
];

const FALLBACK_SETTINGS = {
  company_name: 'Зелений куточок',
  phone: '+38 (097) 966-06-92',
  email: 'info@zelenykutochok.ua',
  address: 'Україна',
  copyright_text: '',
};

const SOCIAL_ICONS = {
  facebook:  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
  instagram: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>,
  telegram:  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M21.8 2.2 2.4 9.8c-1.3.5-1.3 1.3-.2 1.6l4.9 1.5 1.9 5.7c.2.7.4.9 1 .9.4 0 .7-.2 1-.5l2.4-2.3 4.9 3.6c.9.5 1.5.2 1.7-.8l3.1-14.6c.3-1.3-.5-1.9-1.3-1.5z"/></svg>,
  youtube:   <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M22.5 6.4a2.8 2.8 0 0 0-2-2C18.9 4 12 4 12 4s-6.9 0-8.6.4a2.8 2.8 0 0 0-2 2C1 8.1 1 12 1 12s0 3.9.4 5.6a2.8 2.8 0 0 0 2 2C5.1 20 12 20 12 20s6.9 0 8.6-.4a2.8 2.8 0 0 0 2-2c.4-1.7.4-5.6.4-5.6s0-3.9-.5-5.6zM10 15.5v-7l6 3.5-6 3.5z"/></svg>,
  tiktok:    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M19.6 3a4 4 0 0 1-4-4h-3v12.5a2.5 2.5 0 1 1-2.5-2.5c.2 0 .5 0 .7.1V6a6 6 0 1 0 5.3 5.9V8a7.4 7.4 0 0 0 4.3 1.4V6.4A4 4 0 0 1 19.6 3z"/></svg>,
  twitter:   <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M18.2 2h3.1l-6.8 7.8L22.5 22h-6.3l-4.9-6.4-5.6 6.4H2.6l7.3-8.3L2 2h6.4l4.4 5.8zm-1.1 18h1.7L7 3.9H5.2z"/></svg>,
  viber:     <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 1C6 1 2 4.9 2 9.8c0 3 1.5 5.6 4 7.3v3.4l3.3-1.8c.9.2 1.8.3 2.7.3 6 0 10-3.9 10-8.8S18 1 12 1z"/></svg>,
  whatsapp:  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.5 14.4c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.1s-.8 1-.9 1.2c-.2.2-.3.2-.6.1-1.6-.8-2.6-1.4-3.7-3.1-.3-.4.3-.4.8-1.4.1-.2 0-.4-.1-.5l-1.3-3.1c-.3-.8-.7-.7-.9-.7H7.9c-.2 0-.5.1-.8.4C6.8 7.5 6 8.4 6 10.1c0 1.8 1.3 3.5 1.5 3.7 1.6 2.6 3.6 4.1 6.3 5 .8.3 1.5.3 2 .2.6-.1 1.7-.7 2-1.3.2-.6.2-1.2.1-1.3z"/><path d="M12 2a10 10 0 0 0-8.6 14.9L2 22l5.3-1.4A10 10 0 1 0 12 2z"/></svg>,
  linkedin:  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>,
  pinterest: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2C6.5 2 2 6.5 2 12c0 4.2 2.6 7.8 6.4 9.3-.1-.8-.1-2 .1-2.9.3-1.1 1.8-7.5 1.8-7.5s-.5-.9-.5-2.3c0-2.1 1.2-3.7 3-3.7 1.4 0 2.1 1 2.1 2.3 0 1.4-.9 3.5-1.3 5.4-.4 1.6.8 2.9 2.3 2.9 2.7 0 4.8-2.9 4.8-7 0-3.7-2.6-6.2-6.4-6.2-4.3 0-6.9 3.2-6.9 6.5 0 1.3.5 2.6 1.1 3.4z"/></svg>,
  other:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
};

const SOCIAL_COLORS = {
  facebook:  'hover:bg-[#1877F2]',
  instagram: 'hover:bg-gradient-to-br hover:from-[#f09433] hover:via-[#e6683c] hover:to-[#dc2743]',
  telegram:  'hover:bg-[#2CA5E0]',
  youtube:   'hover:bg-[#FF0000]',
  tiktok:    'hover:bg-black',
  twitter:   'hover:bg-black',
  viber:     'hover:bg-[#7360F2]',
  whatsapp:  'hover:bg-[#25D366]',
  linkedin:  'hover:bg-[#0A66C2]',
  pinterest: 'hover:bg-[#E60023]',
  other:     'hover:bg-white/20',
};

const isExternal = (url) => /^https?:\/\//.test(url);

const FooterLink = ({ label, url }) => {
  const cls = 'hover:text-primary-light transition-colors';
  if (isExternal(url)) {
    return <a href={url} className={cls} target="_blank" rel="noopener noreferrer">{label}</a>;
  }
  return <Link to={url} className={cls}>{label}</Link>;
};

const Footer = () => {
  const [sections, setSections] = useState(FALLBACK_SECTIONS);
  const [settings, setSettings] = useState(FALLBACK_SETTINGS);
  const [socials, setSocials] = useState([]);
  const [visitCount, setVisitCount] = useState(null);

  useEffect(() => {
    api.get('/api/content/footer/')
      .then(({ data }) => {
        if (data.sections && data.sections.length > 0) setSections(data.sections);
        if (data.settings) setSettings(data.settings);
        if (data.socials) setSocials(data.socials);
      })
      .catch(() => { /* use fallback */ });
  }, []);

  useEffect(() => {
    const sessionKey = 'zk_visited';
    const alreadyCounted = sessionStorage.getItem(sessionKey);
    if (!alreadyCounted) {
      api.post('/api/content/visit/')
        .then(({ data }) => {
          setVisitCount(data.count);
          sessionStorage.setItem(sessionKey, '1');
        })
        .catch(() => {
          api.get('/api/content/visit/').then(({ data }) => setVisitCount(data.count)).catch(() => {});
        });
    } else {
      api.get('/api/content/visit/').then(({ data }) => setVisitCount(data.count)).catch(() => {});
    }
  }, []);

  const year = new Date().getFullYear();
  const copyright = settings.copyright_text
    || `© ${year} ${settings.company_name}. Всі права захищені.`;

  return (
    <footer className="bg-primary-dark text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Dynamic sections */}
          {sections.map((section) => (
            <div key={section.id} className="text-center md:text-left">
              <h4 className="font-bold text-lg mb-4">{section.title}</h4>
              {section.description && (
                <p className="text-sm text-white/70 mb-3 leading-relaxed">{section.description}</p>
              )}
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.id}>
                    <FooterLink label={link.label} url={link.url} />
                    {link.description && (
                      <p className="text-xs text-white/50 mt-0.5 pl-0 leading-snug">{link.description}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contacts — always shown from settings */}
          <div className="text-center md:text-left">
            <h4 className="font-bold text-lg mb-4">Контакти</h4>
            <ul className="space-y-2">
              {settings.phone && (
                <li className="flex items-center justify-center md:justify-start gap-2">
                  <span>📞</span>
                  <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="hover:text-primary-light transition-colors">
                    {settings.phone}
                  </a>
                </li>
              )}
              {settings.email && (
                <li className="flex items-center justify-center md:justify-start gap-2">
                  <span>✉️</span>
                  <a href={`mailto:${settings.email}`} className="hover:text-primary-light transition-colors">
                    {settings.email}
                  </a>
                </li>
              )}
              {settings.address && (
                <li className="flex items-center justify-center md:justify-start gap-2">
                  <span>📍</span>
                  <span>{settings.address}</span>
                </li>
              )}
              {socials.length > 0 && (
                <li className="flex items-center justify-center md:justify-start gap-2 pt-2 flex-wrap">
                  {socials.map((s) => (
                    <a
                      key={s.id}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={s.name}
                      className={`flex items-center justify-center w-9 h-9 rounded-full bg-white/15 text-white transition-all duration-200 hover:scale-110 hover:text-white ${SOCIAL_COLORS[s.icon] || SOCIAL_COLORS.other}`}
                    >
                      {SOCIAL_ICONS[s.icon] || SOCIAL_ICONS.other}
                    </a>
                  ))}
                </li>
              )}
              {/* Legacy fallback: show hardcoded socials if new socials is empty and old fields set */}
              {socials.length === 0 && (settings.facebook_url || settings.instagram_url || settings.telegram_url) && (
                <li className="flex items-center justify-center md:justify-start gap-2 pt-2">
                  {settings.facebook_url && (
                    <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" title="Facebook" className={`flex items-center justify-center w-9 h-9 rounded-full bg-white/15 text-white transition-all duration-200 hover:scale-110 ${SOCIAL_COLORS.facebook}`}>{SOCIAL_ICONS.facebook}</a>
                  )}
                  {settings.instagram_url && (
                    <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" title="Instagram" className={`flex items-center justify-center w-9 h-9 rounded-full bg-white/15 text-white transition-all duration-200 hover:scale-110 ${SOCIAL_COLORS.instagram}`}>{SOCIAL_ICONS.instagram}</a>
                  )}
                  {settings.telegram_url && (
                    <a href={settings.telegram_url} target="_blank" rel="noopener noreferrer" title="Telegram" className={`flex items-center justify-center w-9 h-9 rounded-full bg-white/15 text-white transition-all duration-200 hover:scale-110 ${SOCIAL_COLORS.telegram}`}>{SOCIAL_ICONS.telegram}</a>
                  )}
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 pt-6 text-sm">
          <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-3">
            {visitCount !== null ? (
              <div className="flex items-center gap-2 text-white/60">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 shrink-0">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <span>
                  Нас відвідали: <span className="font-semibold text-white/80">{visitCount.toLocaleString('uk-UA')}</span> разів
                </span>
              </div>
            ) : (
              <div />
            )}
            <p className="text-white/70">{copyright}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
