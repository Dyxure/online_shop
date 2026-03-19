const db = require("../src/db");

exports.getAllProducts = ({ categoryId, brandId, sizeId, colorId } = {}) => {
  const params = [];
  const where = [];

  if (categoryId) {
    params.push(categoryId);
    where.push(`p.category_id = $${params.length}`);
  }
  if (brandId) {
    params.push(brandId);
    where.push(`p.brand_id = $${params.length}`);
  }
  if (sizeId) {
    params.push(sizeId);
    where.push(`pv.size_id = $${params.length}`);
  }
  if (colorId) {
    params.push(colorId);
    where.push(`pv.color_id = $${params.length}`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  return db.query(
    `
    SELECT
      p.id,
      p.name,
      p.description,
      p.price,
      p.image,
      p.category_id,
      c.name AS category_name,
      p.brand_id,
      b.name AS brand_name,
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'id', pv.id,
            'sizeId', pv.size_id,
            'size', s.name,
            'colorId', pv.color_id,
            'color', co.name,
            'stock', pv.stock
          )
        ) FILTER (WHERE pv.id IS NOT NULL),
        '[]'::json
      ) AS variants
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN brands b ON b.id = p.brand_id
    LEFT JOIN product_variants pv ON pv.product_id = p.id
    LEFT JOIN sizes s ON s.id = pv.size_id
    LEFT JOIN colors co ON co.id = pv.color_id
    ${whereSql}
    GROUP BY p.id, c.name, b.name
    ORDER BY p.id
    `,
    params
  );
};

exports.getProductById = (id) => {
  return db.query(
    `
    SELECT
      p.id,
      p.name,
      p.description,
      p.price,
      p.image,
      p.category_id,
      c.name AS category_name,
      p.brand_id,
      b.name AS brand_name,
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'id', pv.id,
            'sizeId', pv.size_id,
            'size', s.name,
            'colorId', pv.color_id,
            'color', co.name,
            'stock', pv.stock
          )
        ) FILTER (WHERE pv.id IS NOT NULL),
        '[]'::json
      ) AS variants
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN brands b ON b.id = p.brand_id
    LEFT JOIN product_variants pv ON pv.product_id = p.id
    LEFT JOIN sizes s ON s.id = pv.size_id
    LEFT JOIN colors co ON co.id = pv.color_id
    WHERE p.id=$1
    GROUP BY p.id, c.name, b.name
    `,
    [id]
  );
};