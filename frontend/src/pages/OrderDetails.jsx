import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { API } from "../api/api";

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    API.get(`/orders/${id}`)
      .then((res) => setOrder(res.data))
      .catch((e) => setError(e?.response?.data?.error || "Ошибка загрузки заказа"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading && !order) return <div className="container">Загрузка...</div>;
  if (error && !order) return <div className="container">{error}</div>;
  if (!order) return <div className="container">Заказ не найден</div>;

  return (
    <div className="container">
      <div className="page-head">
        <div>
          <div style={{ marginBottom: 6 }}>
            <Link to="/orders">← Все заказы</Link>
          </div>
          <h1 style={{ marginTop: 0, marginBottom: 0 }}>Заказ #{order.id}</h1>
        </div>

        <span className="badge">{order.status || "—"}</span>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="summary-line">
          <div>Дата</div>
          <div>{order.created_at ? new Date(order.created_at).toLocaleString() : "—"}</div>
        </div>
        <div className="summary-total">
          <div>Сумма</div>
          <div>{order.total} ₽</div>
        </div>
      </div>

      <h3>Товары</h3>
      <div className="panel">
        <div className="list">
        {(order.items || []).map((it) => (
          <div key={it.id} className="row">
            <img className="row-img" src={it.image} alt={it.name} />

            <div>
              <div className="row-title">{it.name}</div>
              <div className="row-meta">
                {it.size ? `Размер: ${it.size}` : "Размер: —"}
                {" • "}
                {it.color ? `Цвет: ${it.color}` : "Цвет: —"}
              </div>
            </div>

            <div className="row-price">{it.price} ₽</div>

            <div className="muted" style={{ textAlign: "right" }}>
              x{it.quantity}
            </div>

            <div />
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}

