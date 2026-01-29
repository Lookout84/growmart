import React from 'react';
import './AboutPage.css';

const AboutPage = () => {
  return (
    <div className="about-page">
      <div className="about-hero">
        <div className="container">
          <h1>Про нас</h1>
          <p>Зелений Куточок - ваш надійний партнер у створенні ідеального саду</p>
        </div>
      </div>

      <div className="about-content">
        <div className="container">
          <section className="about-section">
            <h2>Наша історія</h2>
            <p>
              "Зелений Куточок" - це сімейна компанія з багаторічним досвідом у вирощуванні 
              та реалізації саджанців ягідних культур. Ми почали свою діяльність з невеликого 
              розсадника і за роки праці виросли в одного з провідних постачальників якісного 
              посадкового матеріалу в Україні.
            </p>
          </section>

          <section className="about-section">
            <h2>Наші цінності</h2>
            <div className="values-grid">
              <div className="value-card">
                <div className="value-icon">✅</div>
                <h3>Якість</h3>
                <p>Кожен саджанець проходить ретельну перевірку перед відправкою</p>
              </div>
              <div className="value-card">
                <div className="value-icon">💚</div>
                <h3>Екологічність</h3>
                <p>Використовуємо екологічно чисті методи вирощування</p>
              </div>
              <div className="value-card">
                <div className="value-icon">🤝</div>
                <h3>Довіра</h3>
                <p>Цінуємо кожного клієнта і дбаємо про довгострокові відносини</p>
              </div>
              <div className="value-card">
                <div className="value-icon">📚</div>
                <h3>Професіоналізм</h3>
                <p>Надаємо експертні консультації з догляду за рослинами</p>
              </div>
            </div>
          </section>

          <section className="about-section">
            <h2>Чому обирають нас?</h2>
            <ul className="advantages-list">
              <li>✓ Понад 10 років досвіду в садівництві</li>
              <li>✓ Власний розсадник з сучасним обладнанням</li>
              <li>✓ Широкий асортимент сортів ягідних культур</li>
              <li>✓ Гарантія приживлення саджанців</li>
              <li>✓ Швидка доставка по всій Україні</li>
              <li>✓ Професійна підтримка після покупки</li>
              <li>✓ Конкурентні ціни без посередників</li>
            </ul>
          </section>

          <section className="about-section">
            <h2>Наші досягнення</h2>
            <div className="achievements-grid">
              <div className="achievement-card">
                <div className="achievement-number">10+</div>
                <div className="achievement-label">Років досвіду</div>
              </div>
              <div className="achievement-card">
                <div className="achievement-number">50000+</div>
                <div className="achievement-label">Задоволених клієнтів</div>
              </div>
              <div className="achievement-card">
                <div className="achievement-number">100+</div>
                <div className="achievement-label">Сортів рослин</div>
              </div>
              <div className="achievement-card">
                <div className="achievement-number">98%</div>
                <div className="achievement-label">Приживлення саджанців</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
