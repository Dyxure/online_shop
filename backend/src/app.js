const express = require("express");
const cors = require("cors");
const productsRoutes = require("../routes/products");
const cartRoutes = require("../routes/cart");
const categoriesRoutes = require("../routes/categories");
const ordersRoutes = require("../routes/orders");
const brandsRoutes = require("../routes/brands");
const sizesRoutes = require("../routes/sizes");
const colorsRoutes = require("../routes/colors");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/products", productsRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/brands", brandsRoutes);
app.use("/api/sizes", sizesRoutes);
app.use("/api/colors", colorsRoutes);

module.exports = app;