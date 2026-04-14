import React, { useState, useEffect } from 'react';
import api from '../services/api';

const DEFAULTS = {
  hero_subtitle: 'Ми завжди раді відповісти на ваші питання та допомогти з вибором саджанців',
  phone1: '+38 (097) 966-06-92', phone1_href: '+380979660692',
  phone2: '+38 (095) 766-45-05', phone2_href: '+380957664505',
  email: 'info@zelenykutochok.ua',
  address: 'Україна',
  hours_weekday_label: 'ПН–ПТ', hours_weekday: '8:00–18:00',
  hours_saturday_label: 'СБ', hours_saturday: '8:00–15:00',
  hours_sunday_label: 'НД', hours_sunday: 'Вихідний',
  form_subtitle: 'Відповімо протягом одного робочого дня',
};

const ContactPage = () => {
  const [info, setInfo] = useState(DEFAULTS);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);

  useEffect(() => {
    api.get('/content/contact/').then(r => setInfo({ ...DEFAULTS, ...r.data })).catch(() => {});
  }, []);

  const contactItems = [
    {
      icon: '📞', title: 'Телефон', bg: 'bg-green-100',
      content: (
        <>
          <a href={`tel:${info.phone1_href}`} className="hover:text-green-600 transition-colors">{info.phone1}</a>
          {info.phone2 && <a href={`tel:${info.phone2_href}`} className="hover:text-green-600 transition-colors">{info.phone2}</a>}
        </>
      ),
    },
    {
      icon: '✉️', title: 'Email', bg: 'bg-teal-100',
      content: <a href={`mailto:${info.email}`} className="hover:text-green-600 transition-colors break-all">{info.email}</a>,
    },
    {
      icon: '📍', title: 'Адреса', bg: 'bg-emerald-100',
      content: <span>{info.address}</span>,
    },
    {
      icon: '🕐', title: 'Графік роботи', bg: 'bg-lime-100',
      content: (
        <>
          <span>{info.hours_weekday_label}: {info.hours_weekday}</span>
          <span>{info.hours_saturday_label}: {info.hours_saturday}</span>
          <span className="text-gray-400">{info.hours_sunday_label}: {info.hours_sunday}</span>
        </>
      ),
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setFormData({ name: '', email: '', phone: '', message: '' });
    setTimeout(() => setSent(false), 5000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const inputCls = 'w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition text-gray-800 placeholder-gray-400';

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_70%_50%,white_1px,transparent_1px)] bg-[length:24px_24px]" />
        <div className="container relative py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            💬 Завжди на зв'язку
          </div>
          <h1 className="text-5xl font-extrabold mb-4">Контакти</h1>
          <p className="text-xl opacity-90 max-w-xl mx-auto">
            {info.hero_subtitle}
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="container py-16">
        <div className="grid lg:grid-cols-5 gap-10">

          {/* Info cards */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Зв'яжіться з нами</h2>
            {contactItems.map((item) => (
              <div key={item.title} className="flex items-start gap-4 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-green-200 transition-colors">
                <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}>
                  {item.icon}
                </div>
                <div>
                  <div className="font-semibold text-gray-800 mb-1">{item.title}</div>
                  <div className="flex flex-col gap-0.5 text-gray-600 text-sm">
                    {item.content}
                  </div>
                </div>
              </div>
            ))}

            {/* Social hint */}
            <div className="bg-gradient-to-br from-green-50 to-teal-50 border border-green-200 rounded-2xl p-5 mt-2">
              <div className="font-semibold text-gray-800 mb-2">🌿 Слідкуйте за нами</div>
              <p className="text-sm text-gray-600">Актуальні новини, поради зі змісту рослин та спецпропозиції для підписників</p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Написати нам</h2>
              <p className="text-gray-500 text-sm mb-6">{info.form_subtitle}</p>

              {sent && (
                <div className="mb-6 flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-medium">
                  <span className="text-lg">✅</span>
                  Дякуємо! Ми зв'яжемось з вами найближчим часом.
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Ім'я <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Введіть ваше ім'я"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Телефон
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+38 (0__) ___-__-__"
                      className={inputCls}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your@email.com"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Повідомлення <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Введіть ваше повідомлення..."
                    className={inputCls + ' resize-none'}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition-colors text-base mt-1"
                >
                  Відправити повідомлення ✉️
                </button>
              </form>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};

export default ContactPage;
