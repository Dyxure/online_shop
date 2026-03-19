const queries = require("../queries/productsQueries");

exports.getAll = async (req, res) => {
  try {
    const { categoryId, brandId, sizeId, colorId } = req.query;
    const data = await queries.getAllProducts({
      categoryId: categoryId ? Number(categoryId) : undefined,
      brandId: brandId ? Number(brandId) : undefined,
      sizeId: sizeId ? Number(sizeId) : undefined,
      colorId: colorId ? Number(colorId) : undefined,
    });
    res.json(data.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getOne = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await queries.getProductById(id);
    res.json(data.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};