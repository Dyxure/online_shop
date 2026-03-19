import { useEffect, useState } from "react";
import { API } from "../api/api";
import { getSessionId } from "../utils/cart";

export default function Cart() {

  const [items, setItems] = useState([]);
  const [cartId, setCartId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");

    API.get("/cart", {
      params: { sessionId: getSessionId() }
    })
      .then(res => {
        setCartId(res.data.cartId);
        setItems(res.data.items || []);
      })
      .catch(e => {
        setError(e?.response?.data?.error || "Ошибка загрузки корзины");
      })
      .finally(() => setLoading(false));

  };

  useEffect(() => {
    load();
  }, []);

  const remove = (id) => {

    API.post("/cart/remove", {
      itemId: id,
    }).then(load);

  };

  const update = (id, qty) => {

    API.post("/cart/update", {
      itemId: id,
      qty: Number(qty),
    }).then(load);

  };

  const checkout = () => {
    setLoading(true);
    setError("");

    API.post("/orders", {
      sessionId: getSessionId(),
    })
      .then(res => {
        alert(`Заказ оформлен. Номер: ${res.data.orderId}. Сумма: ${res.data.total}`);
        load();
      })
      .catch(e => {
        setError(e?.response?.data?.error || "Ошибка оформления заказа");
      })
      .finally(() => setLoading(false));
  };

  let total = 0;

  items.forEach(i => {
    total += i.price * i.quantity;
  });

  return (
    <div className="container">

      <div className="page-head">
        <h1>Корзина</h1>
        <div className="muted" style={{ fontSize: 12 }}>
          Сессия: {getSessionId().slice(0, 8)}…
        </div>
      </div>

      {error && (
        <div className="danger" style={{ marginBottom: 10 }}>
          {error}
        </div>
      )}

      {loading && <div className="muted" style={{ marginBottom: 10 }}>Загрузка...</div>}

      <div className="layout-2col">
        <div className="panel">
          {items.length === 0 && !loading ? (
            <div className="muted">Корзина пустая</div>
          ) : (
            <div className="list">
              {items.map(i => (
                <div key={i.id} className="row">
                  <img className="row-img" src={i.image} alt={i.name} />

                  <div>
                    <div className="row-title">{i.name}</div>
                    <div className="row-meta">
                      {i.size ? `Размер: ${i.size}` : "Размер: —"}
                      {" • "}
                      {i.color ? `Цвет: ${i.color}` : "Цвет: —"}
                    </div>
                  </div>

                  <div className="row-price">
                    {i.price} ₽
                  </div>

                  <div className="row-qty">
                    <input
                      type="number"
                      value={i.quantity}
                      min={1}
                      onChange={e => update(i.id, e.target.value)}
                    />
                  </div>

                  <div className="row-actions">
                    <button className="btn btn-danger" onClick={() => remove(i.id)}>
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel">
          <div className="summary-line">
            <div>Товаров</div>
            <div>{items.reduce((s, x) => s + Number(x.quantity), 0)}</div>
          </div>
          <div className="summary-line">
            <div>Доставка</div>
            <div>—</div>
          </div>
          <div className="summary-total">
            <div>Итого</div>
            <div>{total} ₽</div>
          </div>

          <button
            className="button"
            onClick={checkout}
            disabled={loading || items.length === 0 || !cartId}
            style={{ marginTop: 14 }}
          >
            Оформить заказ
          </button>

          <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>
            При оформлении мы проверяем остатки и сохраняем заказ в базе.
          </div>
        </div>
      </div>

    </div>
  );
}