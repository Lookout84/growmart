import { useEffect } from 'react';

const SITE = 'Зелений куточок';

/**
 * Встановлює title, description та og:* теги для поточної сторінки.
 * @param {string} title - заголовок сторінки (без назви сайту)
 * @param {string} description - мета-опис
 * @param {string} [image] - URL зображення для OG (необов'язково)
 */
const useSEO = (title, description, image) => {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE}` : `${SITE} — купити саджанці з доставкою по Україні`;
    document.title = fullTitle;

    const setMeta = (name, content, attr = 'name') => {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    if (description) {
      setMeta('description', description);
      setMeta('og:description', description, 'property');
    }
    setMeta('og:title', fullTitle, 'property');
    setMeta('og:url', window.location.href, 'property');
    setMeta('og:type', 'website', 'property');
    if (image) setMeta('og:image', image, 'property');

    return () => {
      document.title = `${SITE} — купити саджанці з доставкою по Україні`;
    };
  }, [title, description, image]);
};

export default useSEO;
