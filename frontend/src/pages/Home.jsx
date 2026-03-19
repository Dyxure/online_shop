import { useEffect, useState } from "react";
import { API } from "../api/api";
import ProductCard from "../components/ProductCard";

export default function Home() {

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [sizes, setSizes] = useState([]);

  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [sizeId, setSizeId] = useState("");

  const loadProducts = () => {
    API.get("/products", {
      params: {
        categoryId: categoryId || undefined,
        brandId: brandId || undefined,
        sizeId: sizeId || undefined,
      }
    }).then(res => setProducts(res.data));
  };

  useEffect(() => {
    Promise.all([
      API.get("/categories"),
      API.get("/brands"),
      API.get("/sizes"),
    ]).then(([c, b, s]) => {
      setCategories(c.data);
      setBrands(b.data);
      setSizes(s.data);
    });
  }, []);

  useEffect(() => {
    loadProducts();
  }, [categoryId, brandId, sizeId]);

  return (
    <div className="container">

      <h1>Каталог</h1>

      <div style={{ display: "flex", gap: 10, margin: "10px 0", flexWrap: "wrap" }}>
        <select value={categoryId} onChange={e => setCategoryId(e.target.value)}>
          <option value="">Все категории</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select value={brandId} onChange={e => setBrandId(e.target.value)}>
          <option value="">Все бренды</option>
          {brands.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        <select value={sizeId} onChange={e => setSizeId(e.target.value)}>
          <option value="">Все размеры</option>
          {sizes.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <button
          className="button"
          onClick={() => {
            setCategoryId("");
            setBrandId("");
            setSizeId("");
          }}
        >
          Сбросить
        </button>
      </div>

      <div className="grid">
        {products.map(p => (
          <ProductCard
            key={p.id}
            product={p}
          />
        ))}
      </div>

    </div>
  );
}