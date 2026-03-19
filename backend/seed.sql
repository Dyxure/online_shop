-- Seed script for PostgreSQL (DEV only)
-- WARNING: This script TRUNCATES tables and resets identities.
-- It fills: categories, brands, sizes, colors, products, product_variants.

BEGIN;

TRUNCATE TABLE
  order_items,
  orders,
  cart_items,
  carts,
  product_variants,
  products,
  categories,
  brands,
  sizes,
  colors
RESTART IDENTITY CASCADE;

-- Base dictionaries
INSERT INTO categories (name) VALUES
  ('Футболки'),
  ('Джинсы'),
  ('Куртки'),
  ('Обувь'),
  ('Аксессуары');

INSERT INTO brands (name) VALUES
  ('North Peak'),
  ('Urban Line'),
  ('DenimWorks'),
  ('StreetCraft'),
  ('Aura'),
  ('Vanta'),
  ('Kinetix');

INSERT INTO sizes (name) VALUES
  ('XS'),
  ('S'),
  ('M'),
  ('L'),
  ('XL'),
  ('42'),
  ('43'),
  ('44'),
  ('45');

INSERT INTO colors (name) VALUES
  ('Черный'),
  ('Белый'),
  ('Серый'),
  ('Синий'),
  ('Зеленый'),
  ('Бежевый'),
  ('Красный');

-- Products + variants generator
DO $$
DECLARE
  p_id INT;
  cat_id INT;
  brand_id INT;
  base_price NUMERIC(10,2);
  i INT;
  s INT;
  c INT;

  -- real photos (Wikimedia Commons FilePath links; usually accessible without geo-block)
  tshirt_imgs TEXT[] := ARRAY[
    'https://www.adverti.ru/media/catalog/product/1/6/16614.30_14.jpg',
    'https://cdn.demix.ru/upload/mdm/media_content/resize/ea4/1000_1000_a10e/106409510299.jpg',
    'https://cdn-sh1.vigbo.com/shops/3903/products/22105188/images/3-ade8aa6172adc40a76924d181eb2662a.jpg'
  ];
  jeans_imgs TEXT[] := ARRAY[
    'https://pizhon-store.ru/assets/images/products/8414/prod/4ae429f2480510a56429cf8b400797e6.webp',
    'https://leecooper.ru/upload/iblock/3cc/nks71q0ovzwxwjgdxaf1anerd1r6p47d.jpg',
    'https://basket-12.wbbasket.ru/vol1790/part179061/179061360/images/big/1.webp'
  ];
  jacket_imgs TEXT[] := ARRAY[
    'https://ir.ozone.ru/s3/multimedia-1-a/c1000/7929728074.jpg',
    'https://stockmann.ru/istk/Nrx5WMfoNTpihxlTcMg1HzMd6LftoDAKknpSZGbhCkg/rs:fill:747::1/g:no/bG9jYWw6Ly8vdXBsb2FkLy9jbXMvc3RhdGljL2Zhc2hpb24tYmxvZy9hcnRpY2xlLzY3N2ZjZTZmZWFhNmRhNWUwYzA5MDdlYS9ibG9jay82NzdmY2Y2NjY3MWZlNzI2NWMwMzQ0MzEvSXNIY3RSTDM4TWgwRkQ1TFBPbTBZVzh2cHh3WjFDVnQ5c0hvbGtJcC5qcGc.jpg',
    'https://st-cdn.tsum.com/sig/27b7068e4d4d6df7313826032df00344/width/400/i/a0/50/cc/fa/baab8488-13c9-4e06-a4d6-4933441668c8.jpg'
  ];
  shoes_imgs TEXT[] := ARRAY[
    'https://static.street-beat.ru/upload/resize_cache/iblock/91f/666_666_1/adyvduov0sfnngeg1hxg84h3ewqq9a2d.jpg',
    'https://st.bmshop.net/itro10671/product/l/krossovki-nike-air-force-1-low-x-tiffany-1-64c45913aa5c0.jpg',
    'https://fireboxclub.com/goodsimg/00000025261/~11.jpg'
  ];
  accessory_imgs TEXT[] := ARRAY[
    'https://cdn1.gum.ru/upload/iblock/0b2/f613ff483ce7d0ba135f9216cf2f7df8.jpg',
    'https://hatsandcaps.ru/components/com_jshopping/files/img_products/60-332-09(0).jpg',
    'https://hatsandcaps.ru/components/com_jshopping/files/img_products/81-131-65(0).jpg'
  ];

  -- size sets (arrays of size ids)
  clothing_sizes INT[] := ARRAY[1,2,3,4,5];     -- XS..XL
  shoe_sizes INT[] := ARRAY[6,7,8,9];           -- 42..45
  accessory_sizes INT[] := ARRAY[3,4];          -- M, L (for belts etc.)

  -- color set
  color_ids INT[] := ARRAY[1,2,3,4,5,6,7];

  -- helper vars
  size_list INT[];
  color_list INT[];
  size_count INT;
  color_count INT;
BEGIN
  -- Create ~30 products
  FOR i IN 1..30 LOOP
    -- Pick category (1..5) and brand (1..7)
    cat_id := 1 + (i % 5);
    brand_id := 1 + (i % 7);

    -- Base price by category
    base_price :=
      CASE cat_id
        WHEN 1 THEN 1490 + (i * 20)         -- t-shirts
        WHEN 2 THEN 3990 + (i * 35)         -- jeans
        WHEN 3 THEN 7990 + (i * 55)         -- jackets
        WHEN 4 THEN 5990 + (i * 45)         -- shoes
        ELSE 990 + (i * 15)                 -- accessories
      END;

    INSERT INTO products (name, description, price, category_id, brand_id, image)
    VALUES (
      CASE cat_id
        WHEN 1 THEN format('Футболка %s %s', i, (SELECT name FROM brands WHERE id=brand_id))
        WHEN 2 THEN format('Джинсы %s %s', i, (SELECT name FROM brands WHERE id=brand_id))
        WHEN 3 THEN format('Куртка %s %s', i, (SELECT name FROM brands WHERE id=brand_id))
        WHEN 4 THEN format('Кроссовки %s %s', i, (SELECT name FROM brands WHERE id=brand_id))
        ELSE format('Аксессуар %s %s', i, (SELECT name FROM brands WHERE id=brand_id))
      END,
      'Качественный товар из коллекции интернет-магазина. Подберите размер и цвет в вариантах.',
      base_price,
      cat_id,
      brand_id,
      -- real product photos (rotate by index)
      CASE cat_id
        WHEN 1 THEN tshirt_imgs[1 + (i % array_length(tshirt_imgs, 1))]
        WHEN 2 THEN jeans_imgs[1 + (i % array_length(jeans_imgs, 1))]
        WHEN 3 THEN jacket_imgs[1 + (i % array_length(jacket_imgs, 1))]
        WHEN 4 THEN shoes_imgs[1 + (i % array_length(shoes_imgs, 1))]
        ELSE accessory_imgs[1 + (i % array_length(accessory_imgs, 1))]
      END
    )
    RETURNING id INTO p_id;

    -- Choose size set
    size_list :=
      CASE cat_id
        WHEN 4 THEN shoe_sizes
        WHEN 5 THEN accessory_sizes
        ELSE clothing_sizes
      END;

    -- Choose a subset of colors (3..5 colors)
    color_count := 3 + (i % 3); -- 3,4,5
    color_list := ARRAY(
      SELECT unnest(color_ids)
      ORDER BY random()
      LIMIT color_count
    );

    size_count := array_length(size_list, 1);

    -- Create variants: (some) sizes x (some) colors
    FOREACH s IN ARRAY size_list LOOP
      FOREACH c IN ARRAY color_list LOOP
        INSERT INTO product_variants (product_id, size_id, color_id, stock)
        VALUES (
          p_id,
          s,
          c,
          -- stock: 0..25 (more stock for basics)
          CASE
            WHEN cat_id IN (1,2) THEN floor(random()*26)::int
            WHEN cat_id IN (3,4) THEN floor(random()*16)::int
            ELSE floor(random()*31)::int
          END
        );
      END LOOP;
    END LOOP;
  END LOOP;
END $$;

COMMIT;

