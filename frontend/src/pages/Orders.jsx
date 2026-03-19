import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API } from "../api/api";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    API.get("/orders")
      .then((res) => setOrders(res.data || []))
      .catch((e) => setError(e?.response?.data?.error || "Ошибка загрузки заказов"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container">
      <div className="page-head">
        <h1>Заказы</h1>
        <span className="badge">История</span>
      </div>

      {error && <div className="danger" style={{ marginBottom: 10 }}>{error}</div>}
      {loading && <div className="muted" style={{ marginBottom: 10 }}>Загрузка...</div>}

      {orders.length === 0 && !loading ? (
        <div className="muted">Пока нет заказов</div>
      ) : (
        <div className="list">
          {orders.map((o) => (
            <div
              key={o.id}
              className="panel order-card"
            >
              <div>
                <div className="row-title">Заказ #{o.id}</div>
                <div className="row-meta">
                  {o.created_at ? new Date(o.created_at).toLocaleString() : ""}
                </div>
                <div className="row-meta">
                  Статус: <span className="badge">{o.status || "—"}</span>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 800, marginBottom: 6 }}>{o.total} ₽</div>
                <Link className="nav-link" to={`/orders/${o.id}`}>Открыть</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

