import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { API } from "../api/api";
import { getSessionId } from "../utils/cart";

export default function Product() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [variantId, setVariantId] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    API.get(`/products/${id}`)
      .then((res) => {
        setProduct(res.data);
        const variants = res.data?.variants || [];
        const firstInStock = variants.find((v) => Number(v.stock) > 0);
        setVariantId(firstInStock?.id || variants[0]?.id || "");
      })
      .catch((e) => setError(e?.response?.data?.error || "Ошибка загрузки товара"))
      .finally(() => setLoading(false));
  }, [id]);

  const variants = product?.variants || [];
  const selectedVariant = useMemo(
    () => variants.find((v) => String(v.id) === String(variantId)),
    [variants, variantId]
  );

  const addToCart = () => {
    if (!variantId) return;
    setLoading(true);
    setError("");
    API.post("/cart/add", {
      sessionId: getSessionId(),
      variantId: Number(variantId),
      qty: 1,
    })
      .catch((e) => setError(e?.response?.data?.error || "Ошибка добавления в корзину"))
      .finally(() => setLoading(false));
  };

  if (loading && !product) return <div className="container">Загрузка...</div>;
  if (error && !product) return <div className="container">{error}</div>;
  if (!product) return <div className="container">Товар не найден</div>;

  return (
    <div className="container">
      <div style={{ marginBottom: 10 }}>
        <Link to="/">← Назад в каталог</Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20 }}>
        <div>
          <img
            src={product.image}
            alt={product.name}
            style={{ width: "100%", borderRadius: 10 }}
          />
        </div>

        <div>
          <h1 style={{ marginTop: 0 }}>{product.name}</h1>
          <div style={{ fontSize: 18, marginBottom: 10 }}>{product.price} ₽</div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
            {variants.length > 0 && (
              <select value={variantId} onChange={(e) => setVariantId(e.target.value)}>
                {variants.map((v) => (
                  <option key={v.id} value={v.id} disabled={Number(v.stock) <= 0}>
                    {v.size || "-"} / {v.color || "-"} {Number(v.stock) <= 0 ? "(нет)" : ""}
                  </option>
                ))}
              </select>
            )}

            <div style={{ fontSize: 12, opacity: 0.7 }}>
              Остаток: {selectedVariant?.stock ?? "-"}
            </div>
          </div>

          {error && (
            <div style={{ marginBottom: 10, color: "crimson" }}>
              {error}
            </div>
          )}

          <button className="button" onClick={addToCart} disabled={loading || !variantId}>
            Добавить в корзину
          </button>

          <div style={{ marginTop: 20 }}>
            <h3>Описание</h3>
            <div style={{ whiteSpace: "pre-wrap", opacity: 0.9 }}>
              {product.description || "—"}
            </div>
          </div>

          <div style={{ marginTop: 20, fontSize: 14, opacity: 0.8 }}>
            <div>Категория: {product.category_name || "—"}</div>
            <div>Бренд: {product.brand_name || "—"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

