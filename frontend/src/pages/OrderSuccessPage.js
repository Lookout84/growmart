import React from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';

const OrderSuccessPage = () => {
  const { state } = useLocation();

  if (!state?.orderNumber) {
    return <Navigate to="/" replace />;
  }

  const { orderNumber, email, paymentMethod } = state;
  const isCard = paymentMethod === 'card';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-teal-500 px-8 py-10 text-center">
            <div className="text-6xl mb-3">🎉</div>
            <h1 className="text-2xl font-bold text-white mb-1">Замовлення прийнято!</h1>
            <p className="text-green-100 text-sm">Дякуємо за вашу покупку</p>
          </div>

          {/* Body */}
          <div className="px-8 py-8 space-y-6">
            {/* Order number */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
              <p className="text-sm text-gray-500 mb-1">Номер замовлення</p>
              <p className="text-2xl font-bold text-green-700">#{orderNumber}</p>
            </div>

            {/* Email notice */}
            {email && (
              <div className="flex items-start gap-3 bg-blue-50 rounded-xl p-4">
                <span className="text-xl">📧</span>
                <p className="text-sm text-gray-600">
                  Підтвердження замовлення надіслано на <strong>{email}</strong>. Перевірте папку «Спам», якщо лист не з'явився.
                </p>
              </div>
            )}

            {/* Payment requisites for card */}
            {isCard && (
              <div className="bg-amber-50 border-l-4 border-amber-400 rounded-xl p-5 space-y-2">
                <p className="font-bold text-amber-800">💳 Реквізити для оплати</p>
                <div className="text-sm text-gray-700 space-y-1">
                  <p><span className="text-gray-500">Отримувач:</span> <strong>ФОП Кравець Ольга Віталіївна</strong></p>
                  <p><span className="text-gray-500">IBAN:</span> <strong>UA879358710000067329000077395</strong></p>
                  <p><span className="text-gray-500">ІПН/ЄДРПОУ:</span> <strong>3411311942</strong></p>
                  <p><span className="text-gray-500">Платіжна установа:</span> <strong>ТОВ НоваПей</strong></p>
                  <p><span className="text-gray-500">Призначення платежу:</span> Замовлення #{orderNumber}</p>
                </div>
                <p className="text-xs text-gray-500 pt-1">
                  Після оплати надішліть підтвердження на{' '}
                  <a href="mailto:zzelenyi.kutochok@gmail.com" className="text-green-600 underline">
                    zzelenyi.kutochok@gmail.com
                  </a>
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <Link
                to="/products"
                className="w-full text-center bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold py-3 rounded-xl transition-all"
              >
                Продовжити покупки
              </Link>
              <Link
                to="/"
                className="w-full text-center border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium py-3 rounded-xl transition-all"
              >
                На головну
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
