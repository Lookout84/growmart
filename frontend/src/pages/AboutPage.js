import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const DEFAULTS = {
  history_title: 'Від маленького розсадника — до лідера ринку',
  history_text_1: '«Зелений Куточок» — це сімейна компанія з багаторічним досвідом у вирощуванні саджанців.',
  history_text_2: 'Сьогодні ми вирощуємо понад 100 сортів малини, полуниці, смородини та інших.',
  stat1_icon: '🏆', stat1_number: '10+', stat1_label: 'Років досвіду',
  stat2_icon: '😊', stat2_number: '50 000+', stat2_label: 'Задоволених клієнтів',
  stat3_icon: '🌸', stat3_number: '100+', stat3_label: 'Сортів рослин',
  stat4_icon: '✅', stat4_number: '98%', stat4_label: 'Приживлення саджанців',
  cta_title: 'Готові почати?',
  cta_text: 'Перегляньте наш каталог та знайдіть ідеальні саджанці',
};

const values = [
  { icon: '🌿', title: 'Якість', desc: 'Кожен саджанець проходить ретельну перевірку.', color: 'from-green-50 to-emerald-50 border-green-200', iconBg: 'bg-green-100' },
  { icon: '🌱', title: 'Екологічність', desc: 'Використовуємо природні методи вирощування.', color: 'from-teal-50 to-cyan-50 border-teal-200', iconBg: 'bg-teal-100' },
  { icon: '🤝', title: 'Довіра', desc: 'Цінуємо кожного клієнта і будуємо довгострокові відносини.', color: 'from-lime-50 to-green-50 border-lime-200', iconBg: 'bg-lime-100' },
  { icon: '📚', title: 'Професіоналізм', desc: 'Наші фахівці нададуть консультації.', color: 'from-emerald-50 to-teal-50 border-emerald-200', iconBg: 'bg-emerald-100' },
];

const advantages = [
  'Понад 10 років досвіду в садівництві',
  'Власний розсадник з сучасним обладнанням',
  'Широкий асортимент сортів ягідних культур',
  'Гарантія приживлення саджанців',
  'Швидка доставка по всій Україні',
  'Професійна підтримка після покупки',
  'Конкурентні ціни без посередників',
];

const AboutPage = () => {
  const [content, setContent] = useState(DEFAULTS);

  useEffect(() => {
    api.get('/content/about/').then(r => setContent({ ...DEFAULTS, ...r.data })).catch(() => {});
  }, []);

  const stats = [
    { number: content.stat1_number, label: content.stat1_label, icon: content.stat1_icon },
    { number: content.stat2_number, label: content.stat2_label, icon: content.stat2_icon },
    { number: content.stat3_number, label: content.stat3_label, icon: content.stat3_icon },
    { number: content.stat4_number, label: content.stat4_label, icon: content.stat4_icon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="relative bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_50%,white_1px,transparent_1px)] bg-[length:24px_24px]" />
        <div className="container relative py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            🌿 Сімейна компанія з 2014 року
          </div>
          <h1 className="text-5xl font-extrabold mb-4 leading-tight">Зелений Куточок</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Ваш надійний партнер у створенні ідеального саду.
          </p>
        </div>
      </section>
      <section className="bg-white border-b border-gray-100 shadow-sm">
        <div className="container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl mb-1">{s.icon}</div>
                <div className="text-3xl font-extrabold text-green-600">{s.number}</div>
                <div className="text-sm text-gray-500 font-medium mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="container py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-green-600 font-semibold text-sm uppercase tracking-widest">Наша історія</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-5">{content.history_title}</h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-4">{content.history_text_1}</p>
            <p className="text-gray-600 text-lg leading-relaxed">{content.history_text_2}</p>
          </div>
          <div className="relative">
            <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-3xl p-8 text-white shadow-2xl">
              <div className="text-6xl mb-4 text-center">🌱</div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-white/20 rounded-2xl p-4"><div className="font-bold text-2xl">2014</div><div className="text-sm opacity-80">Рік заснування</div></div>
                <div className="bg-white/20 rounded-2xl p-4"><div className="font-bold text-2xl">Вся Україна</div><div className="text-sm opacity-80">Доставка</div></div>
                <div className="bg-white/20 rounded-2xl p-4"><div className="font-bold text-2xl">Свій</div><div className="text-sm opacity-80">Розсадник</div></div>
                <div className="bg-white/20 rounded-2xl p-4"><div className="font-bold text-2xl">100%</div><div className="text-sm opacity-80">Гарантія якості</div></div>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 rounded-2xl px-4 py-2 font-bold text-sm shadow-lg rotate-3">
              🏆 Топ постачальник
            </div>
          </div>
        </div>
      </section>
      <section className="bg-white py-16">
        <div className="container">
          <div className="text-center mb-12">
            <span className="text-green-600 font-semibold text-sm uppercase tracking-widest">Наші цінності</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2">Що нас відрізняє</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className={`rounded-3xl border bg-gradient-to-br ${v.color} p-6 hover:shadow-lg transition-shadow`}>
                <div className={`w-14 h-14 ${v.iconBg} rounded-2xl flex items-center justify-center text-3xl mb-4`}>{v.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="container py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 grid grid-cols-1 gap-3">
            {advantages.map((a) => (
              <div key={a} className="flex items-start gap-3 bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100 hover:border-green-200 transition-colors">
                <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-sm">✓</span>
                <span className="text-gray-700 font-medium">{a}</span>
              </div>
            ))}
          </div>
          <div className="order-1 md:order-2">
            <span className="text-green-600 font-semibold text-sm uppercase tracking-widest">Переваги</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-5">Чому обирають нас?</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Ми не просто продаємо рослини — ми допомагаємо вашому саду процвітати.
            </p>
          </div>
        </div>
      </section>
      <section className="bg-gradient-to-r from-green-600 to-teal-600 text-white py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">{content.cta_title}</h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">{content.cta_text}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products" className="bg-white text-green-700 font-bold px-8 py-3 rounded-full hover:bg-gray-100 transition-colors">
              Переглянути каталог
            </Link>
            <Link to="/contact" className="bg-white/20 backdrop-blur-sm text-white font-bold px-8 py-3 rounded-full hover:bg-white/30 transition-colors border border-white/40">
              Зв'язатися з нами
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
