import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <div className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-badge" />
          Магазин
        </Link>

        <div className="nav-links">
          <Link to="/orders" className="nav-link">
            Заказы
          </Link>

          <Link to="/cart" className="nav-link">
            Корзина
          </Link>
        </div>
      </div>
    </div>
  );
}