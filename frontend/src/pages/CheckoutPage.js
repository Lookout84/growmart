import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuthStore, useCartStore } from '../store';


const CheckoutPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, login } = useAuthStore();
  const { cart, clearCart, guestItems, clearGuestCart } = useCartStore();

  const [loading, setLoading] = useState(false);
  const [deliveryMethods, setDeliveryMethods] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [wantsAccount, setWantsAccount] = useState(false);
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');

  // Nova Poshta state
  const [npCitySearch, setNpCitySearch] = useState('');
  const [npCities, setNpCities] = useState([]);
  const [npCitiesLoading, setNpCitiesLoading] = useState(false);
  const [npSelectedCity, setNpSelectedCity] = useState(null);
  const [npWarehouses, setNpWarehouses] = useState([]);
  const [npWarehousesLoading, setNpWarehousesLoading] = useState(false);
  const [npSelectedWarehouse, setNpSelectedWarehouse] = useState(null);
  const [npDropdownOpen, setNpDropdownOpen] = useState(false);
  const npSearchTimeout = useRef(null);
  const npDropdownRef = useRef(null);

  // Ukrposhta state
  const [upCitySearch, setUpCitySearch] = useState('');
  const [upCities, setUpCities] = useState([]);
  const [upCitiesLoading, setUpCitiesLoading] = useState(false);
  const [upSelectedCity, setUpSelectedCity] = useState(null);
  const [upBranchNumber, setUpBranchNumber] = useState('');
  const [upDropdownOpen, setUpDropdownOpen] = useState(false);
  const upSearchTimeout = useRef(null);
  const upDropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    postal_code: user?.postal_code || '',
    country: user?.country || 'Україна',
    delivery_method: 'nova_poshta',
    payment_method: 'cash',
    notes: '',
  });

  // Fetch active delivery methods (cache-buster ensures fresh data after admin changes)
  useEffect(() => {
    api.get('/api/orders/delivery-methods/', { params: { _: Date.now() } }).then(({ data }) => {
      setDeliveryMethods(data);
      if (data.length > 0) {
        setFormData((f) => ({ ...f, delivery_method: data[0].code }));
      }
    }).catch(() => {});
  }, []);

  // Fetch active payment methods
  useEffect(() => {
    api.get('/api/orders/payment-methods/', { params: { _: Date.now() } }).then(({ data }) => {
      setPaymentMethods(data);
      if (data.length > 0) {
        setFormData((f) => ({ ...f, payment_method: data[0].code }));
      }
    }).catch(() => {});
  }, []);

  // Redirect authenticated users to cart if cart is empty
  useEffect(() => {
    if (isAuthenticated && (!cart || cart.total_items === 0)) {
      navigate('/cart');
    }
  }, [cart, isAuthenticated, navigate]);

  // Redirect guests to cart if guest cart is empty
  useEffect(() => {
    if (!isAuthenticated && guestItems.length === 0) {
      navigate('/cart');
    }
  }, [isAuthenticated, guestItems, navigate]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (npDropdownRef.current && !npDropdownRef.current.contains(e.target)) setNpDropdownOpen(false);
      if (upDropdownRef.current && !upDropdownRef.current.contains(e.target)) setUpDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounced NP city search
  const handleNpCitySearchChange = useCallback((value) => {
    setNpCitySearch(value);
    setNpDropdownOpen(true);
    clearTimeout(npSearchTimeout.current);
    if (value.length < 2) { setNpCities([]); return; }
    npSearchTimeout.current = setTimeout(async () => {
      setNpCitiesLoading(true);
      try {
        const { data } = await api.get(`/api/orders/np/cities/?search=${encodeURIComponent(value)}`);
        setNpCities(data);
      } catch {
        setNpCities([]);
      } finally {
        setNpCitiesLoading(false);
      }
    }, 400);
  }, []);

  const handleSelectNpCity = useCallback(async (city) => {
    setNpSelectedCity(city);
    setNpCitySearch(city.name);
    setNpDropdownOpen(false);
    setNpSelectedWarehouse(null);
    setFormData((f) => ({ ...f, city: city.name }));
    setNpWarehouses([]);
    setNpWarehousesLoading(true);
    try {
      const { data } = await api.get(`/api/orders/np/warehouses/?city_ref=${city.ref}`);
      setNpWarehouses(data);
    } catch {
      toast.error('Не вдалося завантажити відділення');
    } finally {
      setNpWarehousesLoading(false);
    }
  }, []);

  const handleSelectNpWarehouse = useCallback((w) => {
    setNpSelectedWarehouse(w);
    setFormData((f) => ({ ...f, address: w.description }));
  }, []);

  // Debounced UP city search
  const handleUpCitySearchChange = useCallback((value) => {
    setUpCitySearch(value);
    setUpDropdownOpen(true);
    clearTimeout(upSearchTimeout.current);
    if (value.length < 2) { setUpCities([]); return; }
    upSearchTimeout.current = setTimeout(async () => {
      setUpCitiesLoading(true);
      try {
        const { data } = await api.get(`/api/orders/up/cities/?search=${encodeURIComponent(value)}`);
        setUpCities(data);
      } catch {
        setUpCities([]);
      } finally {
        setUpCitiesLoading(false);
      }
    }, 400);
  }, []);

  const handleSelectUpCity = useCallback((city) => {
    setUpSelectedCity(city);
    setUpCitySearch(city.name);
    setUpDropdownOpen(false);
    setFormData((f) => ({ ...f, city: city.name }));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Compute cart items & totals depending on auth state
  const cartItems = isAuthenticated
    ? (cart?.items || []).map((i) => ({ id: i.id, name: i.product.name + (i.variant ? ` (${i.variant.name})` : ''), qty: i.quantity, price: i.variant ? Number(i.variant.price) : i.product.final_price, lineTotal: i.total_price }))
    : guestItems.map((i) => { const p = i.variant ? Number(i.variant.price) : (i.product.final_price || i.product.price || 0); return { id: i._key, name: i.product.name + (i.variant ? ` (${i.variant.name})` : ''), qty: i.quantity, price: p, lineTotal: p * i.quantity }; });

  const subtotal = isAuthenticated
    ? (cart?.total_price || 0)
    : guestItems.reduce((s, i) => { const p = i.variant ? Number(i.variant.price) : (i.product.final_price || i.product.price || 0); return s + p * i.quantity; }, 0);
  const activeMethod = deliveryMethods.find((m) => m.code === formData.delivery_method);
  const shipping = activeMethod ? Number(activeMethod.price) : 0;
  const orderTotal = subtotal + shipping;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.delivery_method === 'nova_poshta' && !npSelectedWarehouse) {
      toast.error('Оберіть відділення Нової Пошти');
      return;
    }
    if (formData.delivery_method === 'ukr_poshta' && (!upSelectedCity || !upBranchNumber.trim())) {
      toast.error('Вкажіть місто та номер відділення Укрпошти');
      return;
    }
    if (formData.delivery_method === 'ukr_poshta') {
      setFormData((f) => ({ ...f, address: `Укрпошта №${upBranchNumber.trim()}` }));
    }

    if (!isAuthenticated && wantsAccount) {
      if (!password) { toast.error('Введіть пароль'); return; }
      if (password !== password2) { toast.error('Паролі не співпадають'); return; }
      if (password.length < 8) { toast.error('Пароль повинен містити щонайменше 8 символів'); return; }
    }

    setLoading(true);
    try {
      if (isAuthenticated) {
        await api.post('/api/orders/', formData);
        clearCart();
        toast.success('Замовлення успішно оформлено!');
        navigate('/orders');
      } else {
        const payload = {
          ...formData,
          items: guestItems.map((i) => ({ product_id: i.product.id, quantity: i.quantity, ...(i.variant ? { variant_id: i.variant.id } : {}) })),
          create_account: wantsAccount,
          password: wantsAccount ? password : '',
        };
        const response = await api.post('/api/orders/guest_create/', payload);
        clearGuestCart();
        if (response.data.tokens) {
          login(response.data.user, response.data.tokens);
          toast.success(`Замовлення оформлено! Акаунт створено. Ваш логін: ${response.data.user.username}`);
          navigate('/orders');
        } else {
          navigate('/order-success', {
            state: {
              orderNumber: response.data.order_number,
              email: formData.email,
              paymentMethod: formData.payment_method,
            },
          });
        }
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.error || 'Помилка оформлення замовлення');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-700';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

  const isNovaPoshta = formData.delivery_method === 'nova_poshta';
  const isUkrPoshta = formData.delivery_method === 'ukr_poshta';

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Оформлення замовлення</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="flex-1 space-y-8">

          {/* Contact */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Контактна інформація</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Ім'я *</label>
                <input type="text" name="first_name" className={inputCls} value={formData.first_name} onChange={handleChange} required />
              </div>
              <div>
                <label className={labelCls}>Прізвище *</label>
                <input type="text" name="last_name" className={inputCls} value={formData.last_name} onChange={handleChange} required />
              </div>
              <div>
                <label className={labelCls}>Email *</label>
                <input type="email" name="email" className={inputCls} value={formData.email} onChange={handleChange} required />
              </div>
              <div>
                <label className={labelCls}>Телефон *</label>
                <input type="tel" name="phone" className={inputCls} value={formData.phone} onChange={handleChange} required />
              </div>
            </div>
          </section>

          {/* Delivery & Payment method selection */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Доставка та оплата</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Спосіб доставки *</label>
                <select
                  name="delivery_method"
                  className={inputCls}
                  value={formData.delivery_method}
                  onChange={(e) => {
                    handleChange(e);
                    setNpSelectedCity(null); setNpSelectedWarehouse(null); setNpCitySearch(''); setNpWarehouses([]);
                    setUpSelectedCity(null); setUpCitySearch(''); setUpBranchNumber('');
                  }}
                  required
                >
                  {deliveryMethods.map((m) => (
                    <option key={m.code} value={m.code}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Спосіб оплати *</label>
                <select name="payment_method" className={inputCls} value={formData.payment_method} onChange={handleChange} required>
                  {paymentMethods.map((m) => (
                    <option key={m.code} value={m.code}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Nova Poshta city + warehouse */}
            {isNovaPoshta && (
              <div className="mt-5 space-y-4">
                <div className="relative" ref={npDropdownRef}>
                  <label className={labelCls}>Місто *</label>
                  <input
                    type="text"
                    className={inputCls}
                    placeholder="Почніть вводити назву міста..."
                    value={npCitySearch}
                    onChange={(e) => handleNpCitySearchChange(e.target.value)}
                    onFocus={() => npCities.length > 0 && setNpDropdownOpen(true)}
                    autoComplete="off"
                    required={isNovaPoshta && !npSelectedCity}
                  />
                  {npCitiesLoading && (
                    <div className="absolute right-3 top-9 text-gray-400 text-sm">Пошук...</div>
                  )}
                  {npDropdownOpen && npCities.length > 0 && (
                    <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-auto">
                      {npCities.map((city) => (
                        <li
                          key={city.ref}
                          className="px-4 py-2.5 hover:bg-green-50 cursor-pointer text-sm text-gray-700"
                          onMouseDown={() => handleSelectNpCity(city)}
                        >
                          {city.name}
                          {city.area && <span className="text-gray-400 text-xs ml-1">({city.area})</span>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {npSelectedCity && (
                  <div>
                    <label className={labelCls}>Відділення / поштомат *</label>
                    {npWarehousesLoading ? (
                      <div className="text-sm text-gray-500 py-2">Завантаження відділень...</div>
                    ) : npWarehouses.length > 0 ? (
                      <select
                        className={inputCls}
                        value={npSelectedWarehouse?.ref || ''}
                        onChange={(e) => {
                          const w = npWarehouses.find((x) => x.ref === e.target.value);
                          if (w) handleSelectNpWarehouse(w);
                        }}
                        required
                      >
                        <option value="">— Оберіть відділення —</option>
                        {npWarehouses.map((w) => (
                          <option key={w.ref} value={w.ref}>
                            №{w.number} — {w.description}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-sm text-gray-500 py-2">Відділення не знайдено</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Ukrposhta city autocomplete + branch number */}
            {isUkrPoshta && (
              <div className="mt-5 space-y-4">
                <div className="relative" ref={upDropdownRef}>
                  <label className={labelCls}>Місто *</label>
                  <input
                    type="text"
                    className={inputCls}
                    placeholder="Почніть вводити назву міста..."
                    value={upCitySearch}
                    onChange={(e) => handleUpCitySearchChange(e.target.value)}
                    onFocus={() => upCities.length > 0 && setUpDropdownOpen(true)}
                    autoComplete="off"
                    required={isUkrPoshta && !upSelectedCity}
                  />
                  {upCitiesLoading && (
                    <div className="absolute right-3 top-9 text-gray-400 text-sm">Пошук...</div>
                  )}
                  {upDropdownOpen && upCities.length > 0 && (
                    <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-auto">
                      {upCities.map((city, idx) => (
                        <li
                          key={idx}
                          className="px-4 py-2.5 hover:bg-green-50 cursor-pointer text-sm text-gray-700"
                          onMouseDown={() => handleSelectUpCity(city)}
                        >
                          {city.name}
                          {city.region && <span className="text-gray-400 text-xs ml-1">({city.region})</span>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <label className={labelCls}>Номер відділення Укрпошти *</label>
                  <input
                    type="text"
                    className={inputCls}
                    placeholder="Наприклад: 14"
                    value={upBranchNumber}
                    onChange={(e) => setUpBranchNumber(e.target.value)}
                    required={isUkrPoshta}
                  />
                </div>
                <div>
                  <label className={labelCls}>Індекс</label>
                  <input type="text" name="postal_code" className={inputCls} value={formData.postal_code} onChange={handleChange} />
                </div>
              </div>
            )}

            {/* Manual address for courier / pickup */}
            {!isNovaPoshta && !isUkrPoshta && (
              <div className="mt-5 space-y-4">
                <div>
                  <label className={labelCls}>Місто *</label>
                  <input type="text" name="city" className={inputCls} value={formData.city} onChange={handleChange} required />
                </div>
                <div>
                  <label className={labelCls}>Адреса *</label>
                  <input type="text" name="address" className={inputCls} value={formData.address} onChange={handleChange} required />
                </div>
                <div>
                  <label className={labelCls}>Індекс</label>
                  <input type="text" name="postal_code" className={inputCls} value={formData.postal_code} onChange={handleChange} />
                </div>
              </div>
            )}

            <div className="mt-4">
              <label className={labelCls}>Примітки</label>
              <textarea name="notes" className={inputCls} rows="3" value={formData.notes} onChange={handleChange} />
            </div>
          </section>

          {/* Optional account creation for guests */}
          {!isAuthenticated && (
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-green-600"
                  checked={wantsAccount}
                  onChange={(e) => setWantsAccount(e.target.checked)}
                />
                <span className="font-medium text-gray-800">Створити акаунт для відстеження замовлень</span>
              </label>
              {wantsAccount && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Пароль *</label>
                    <input type="password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Мінімум 8 символів" />
                  </div>
                  <div>
                    <label className={labelCls}>Підтвердіть пароль *</label>
                    <input type="password" className={inputCls} value={password2} onChange={(e) => setPassword2(e.target.value)} placeholder="Повторіть пароль" />
                  </div>
                </div>
              )}
              <p className="text-sm text-gray-500 mt-3">
                Вже маєте акаунт?{' '}
                <Link to="/login" className="text-green-600 hover:underline">Увійти</Link>
              </p>
            </section>
          )}

          <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-4 rounded-2xl text-lg font-semibold hover:bg-green-700 transition disabled:opacity-60">
            {loading ? 'Оформлення...' : 'Підтвердити замовлення'}
          </button>
        </form>

        {/* ── Order summary ── */}
        <div className="lg:w-80 h-fit bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Ваше замовлення</h2>
          <div className="space-y-3 mb-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between text-sm text-gray-700">
                <span className="flex-1 pr-2 line-clamp-2">{item.name} ×{item.qty}</span>
                <span className="font-semibold flex-shrink-0">{Number(item.lineTotal).toFixed(2)} ₴</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Товари:</span>
              <span>{Number(subtotal).toFixed(2)} ₴</span>
            </div>
            <div className="flex justify-between">
              <span>Доставка:</span>
              <span>{shipping === 0 ? 'Безкоштовно' : `${shipping.toFixed(2)} ₴`}</span>
            </div>
            <div className="flex justify-between font-bold text-base text-gray-800 border-t pt-2 mt-1">
              <span>Разом:</span>
              <span>{Number(orderTotal).toFixed(2)} ₴</span>
            </div>
          </div>
          {isNovaPoshta && npSelectedCity && (
            <div className="mt-4 pt-4 border-t text-xs text-gray-500 space-y-1">
              <p><span className="font-medium text-gray-700">Місто:</span> {npSelectedCity.name}</p>
              {npSelectedWarehouse && (
                <p><span className="font-medium text-gray-700">Відділення НП:</span> №{npSelectedWarehouse.number}</p>
              )}
            </div>
          )}
          {isUkrPoshta && upSelectedCity && (
            <div className="mt-4 pt-4 border-t text-xs text-gray-500 space-y-1">
              <p><span className="font-medium text-gray-700">Місто:</span> {upSelectedCity.name}</p>
              {upBranchNumber && (
                <p><span className="font-medium text-gray-700">Відділення УП:</span> №{upBranchNumber}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
