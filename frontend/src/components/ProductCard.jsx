import { API } from "../api/api";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getSessionId } from "../utils/cart";

export default function ProductCard({ product }) {
  const variants = product.variants || [];
  const inStockVariants = useMemo(
    () => variants.filter(v => Number(v.stock) > 0),
    [variants]
  );

  const [variantId, setVariantId] = useState(
    inStockVariants[0]?.id || variants[0]?.id || ""
  );

  const add = () => {
    if (!variantId) return;

    API.post("/cart/add", {
      sessionId: getSessionId(),
      variantId: Number(variantId),
      qty: 1,
    });

  };

  return (
    <div className="card">

      <Link to={`/product/${product.id}`} style={{ textDecoration: "none", color: "inherit" }}>
        <img src={product.image} alt={product.name} />
      </Link>

      <Link to={`/product/${product.id}`} style={{ textDecoration: "none", color: "inherit" }}>
        <h3>{product.name}</h3>
      </Link>

      <div>{product.price}₽</div>

      {variants.length > 0 && (
        <div style={{ display: "flex", gap: 8, alignItems: "center", margin: "10px 0" }}>
          <select
            value={variantId}
            onChange={e => setVariantId(e.target.value)}
          >
            {variants.map(v => (
              <option
                key={v.id}
                value={v.id}
                disabled={Number(v.stock) <= 0}
              >
                {v.size || "-"} / {v.color || "-"} {Number(v.stock) <= 0 ? "(нет)" : ""}
              </option>
            ))}
          </select>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            Остаток: {variants.find(v => String(v.id) === String(variantId))?.stock ?? "-"}
          </div>
        </div>
      )}

      <button
        className="button"
        onClick={add}
        disabled={!variantId}
      >
        Добавить в корзину
      </button>

      <div style={{ marginTop: 10 }}>
        <Link to={`/product/${product.id}`}>Подробнее</Link>
      </div>

    </div>
  );
}