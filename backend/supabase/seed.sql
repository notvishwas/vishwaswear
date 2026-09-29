-- Catalog seed: 5 categories, 20 products, variants and images.
-- Safe to re-run: rows are matched on slug / sku and skipped if they exist.
-- Prices are integer paise (₹18,999 = 1899900).
-- Image URLs point at /products/*.svg in public/. Replace them with real photos
-- (upload to the `product-images` bucket and update product_images.url) before launch.

insert into public.categories (name, slug, description, image_url, sort_order) values
  ('Suits',    'suits',    'Two- and three-piece suits cut from fine wool for weddings, boardrooms and everything between.', '/products/suits-1.svg',    1),
  ('Blazers',  'blazers',  'Unstructured and tailored blazers that move easily from office to evening.',                    '/products/blazers-1.svg',  2),
  ('Coats',    'coats',    'Overcoats and peacoats in heavy wool for the coldest months.',                                   '/products/coats-1.svg',    3),
  ('Trousers', 'trousers', 'Tailored trousers and chinos with a clean, considered drape.',                                   '/products/trousers-1.svg', 4),
  ('Shirts',   'shirts',   'Crisp cotton and linen shirts, cut slim and finished by hand.',                                  '/products/shirts-1.svg',   5)
on conflict (slug) do nothing;

-- ── Products ────────────────────────────────────────────────
insert into public.products
  (category_id, name, slug, description, price_paise, compare_at_price_paise, fabric, fit, care_instructions, is_featured)
select c.id, v.name, v.slug, v.description, v.price_paise, v.compare_at, v.fabric, v.fit, v.care, v.is_featured
from (values
  -- Suits
  ('suits', 'Charcoal Wool Two-Piece Suit', 'charcoal-wool-two-piece-suit',
   'A wardrobe cornerstone in a fine charcoal worsted wool. Half-canvassed jacket with notch lapels, two-button front and flat-front trousers.',
   1899900, null, '100% Super 110s wool', 'Tailored fit',
   'Dry clean only. Steam to refresh. Store on a wide wooden hanger.', true),
  ('suits', 'Midnight Navy Three-Piece Suit', 'midnight-navy-three-piece-suit',
   'Jacket, waistcoat and trousers in a deep midnight navy wool. Peak lapels and a fully lined body for formal occasions.',
   2499900, null, '98% wool, 2% elastane', 'Slim fit',
   'Dry clean only. Do not tumble dry. Press with a cloth on low heat.', true),
  ('suits', 'Slate Grey Glen Check Suit', 'slate-grey-glen-check-suit',
   'A subtle glen check in slate grey, woven in a lightweight wool blend that breathes through long days.',
   2199900, 2599900, 'Wool and polyester blend', 'Regular fit',
   'Dry clean only. Air out after wearing.', false),
  ('suits', 'Black Tuxedo with Satin Lapel', 'black-tuxedo-with-satin-lapel',
   'Black wool tuxedo with satin peak lapels, satin-covered buttons and side-stripe trousers.',
   2799900, null, 'Wool with satin trim', 'Slim fit',
   'Dry clean only. Store in a breathable garment bag.', false),
  -- Blazers
  ('blazers', 'Navy Herringbone Blazer', 'navy-herringbone-blazer',
   'A half-lined blazer in navy herringbone wool with patch pockets and horn-effect buttons.',
   1299900, null, '100% wool herringbone', 'Tailored fit',
   'Dry clean only. Brush gently with a garment brush.', true),
  ('blazers', 'Olive Linen Blazer', 'olive-linen-blazer',
   'Unstructured and unlined for warm weather. Washed Italian linen in a muted olive.',
   1099900, null, '100% linen', 'Relaxed fit',
   'Dry clean recommended. Light creasing is part of the character of linen.', false),
  ('blazers', 'Camel Houndstooth Blazer', 'camel-houndstooth-blazer',
   'A warm camel houndstooth in a soft wool blend. Single-breasted with a notch lapel and two flap pockets.',
   1499900, 1799900, 'Wool and cashmere blend', 'Regular fit',
   'Dry clean only. Store on a shaped hanger.', false),
  ('blazers', 'Black Textured Cotton Blazer', 'black-textured-cotton-blazer',
   'A clean black blazer in textured stretch cotton. Easy to layer, easy to travel in.',
   999900, null, '97% cotton, 3% elastane', 'Slim fit',
   'Machine wash cold on a delicate cycle, inside out. Hang to dry.', false),
  -- Coats
  ('coats', 'Camel Overcoat', 'camel-overcoat',
   'A knee-length single-breasted overcoat in soft camel wool and cashmere, with a concealed placket and satin-lined body.',
   2299900, null, '80% wool, 20% cashmere', 'Regular fit',
   'Dry clean only. Brush with the nap. Store on a padded hanger.', true),
  ('coats', 'Charcoal Wool Chesterfield Coat', 'charcoal-wool-chesterfield-coat',
   'The classic Chesterfield with a velvet collar, in heavy charcoal wool. Fully lined and cut just above the knee.',
   2599900, null, '100% wool with velvet collar', 'Tailored fit',
   'Dry clean only. Do not iron the velvet collar.', false),
  ('coats', 'Navy Peacoat', 'navy-peacoat',
   'A double-breasted peacoat in dense navy Melton wool with a wide collar and anchor-free horn buttons.',
   1899900, null, '85% wool, 15% nylon Melton', 'Regular fit',
   'Dry clean only. Spot clean with a damp cloth.', false),
  -- Trousers
  ('trousers', 'Grey Flannel Pleated Trousers', 'grey-flannel-pleated-trousers',
   'Single-pleat trousers in mid-grey wool flannel with a high rise and side adjusters.',
   349900, null, '100% wool flannel', 'Relaxed taper',
   'Dry clean only. Press with steam on the reverse side.', false),
  ('trousers', 'Navy Tapered Wool Trousers', 'navy-tapered-wool-trousers',
   'Flat-front tapered trousers in a navy wool blend that holds a crease through the day.',
   399900, null, 'Wool and polyester blend', 'Tapered fit',
   'Dry clean only. Or machine wash cold on wool cycle and hang to dry.', true),
  ('trousers', 'Beige Cotton Chinos', 'beige-cotton-chinos',
   'Garment-dyed cotton chinos in a soft stone beige. A weekday staple with a little stretch.',
   249900, null, '98% cotton, 2% elastane', 'Slim fit',
   'Machine wash cold. Tumble dry low. Iron on medium heat.', false),
  ('trousers', 'Charcoal Slim Fit Trousers', 'charcoal-slim-fit-trousers',
   'Sharp slim trousers in charcoal twill with a mid rise and a clean, unbroken line.',
   329900, 399900, 'Wool blend twill', 'Slim fit',
   'Dry clean recommended. Cool iron if needed.', false),
  -- Shirts
  ('shirts', 'Slim Fit Oxford Shirt in White', 'slim-fit-oxford-shirt-in-white',
   'A crisp white Oxford cloth shirt with a button-down collar. Soft after the first wash and sharp under a blazer.',
   199900, null, '100% cotton Oxford', 'Slim fit',
   'Machine wash warm. Tumble dry low. Iron while damp.', true),
  ('shirts', 'Light Blue Poplin Shirt', 'light-blue-poplin-shirt',
   'A fine-count poplin in pale sky blue with a semi-spread collar and mother-of-pearl buttons.',
   179900, null, '100% cotton poplin', 'Regular fit',
   'Machine wash cold. Do not bleach. Iron on medium heat.', false),
  ('shirts', 'Pink Striped Cotton Shirt', 'pink-striped-cotton-shirt',
   'Fine pink and white stripes in a smooth two-ply cotton. Cut with a spread collar for wearing with or without a tie.',
   189900, null, '100% two-ply cotton', 'Slim fit',
   'Machine wash cold. Tumble dry low. Iron on medium heat.', false),
  ('shirts', 'Navy Linen Shirt', 'navy-linen-shirt',
   'A breathable navy linen shirt with a soft camp collar and a single chest pocket.',
   219900, null, '100% linen', 'Relaxed fit',
   'Machine wash cold. Line dry. Iron damp for a smoother finish.', false),
  ('shirts', 'Ivory Tailored Dress Shirt', 'ivory-tailored-dress-shirt',
   'A refined dress shirt in ivory cotton twill with a hidden button placket and double cuffs for cufflinks.',
   229900, 269900, '100% cotton twill', 'Tailored fit',
   'Machine wash cold. Iron on medium heat. Do not tumble dry.', false)
) as v (category_slug, name, slug, description, price_paise, compare_at, fabric, fit, care, is_featured)
join public.categories c on c.slug = v.category_slug
on conflict (slug) do nothing;

-- ── Images (two per product) ────────────────────────────────
insert into public.product_images (product_id, url, alt, sort_order)
select p.id, '/products/' || p.slug || '-' || n || '.svg', p.name || case n when 1 then ', front view' else ', detail view' end, n - 1
from public.products p
cross join generate_series(1, 2) as n
where not exists (select 1 from public.product_images i where i.product_id = p.id);

-- ── Variants ────────────────────────────────────────────────
-- SKU = code-COL-SIZE. Stock varies by size so a few sizes run low.
insert into public.product_variants (product_id, size, color, sku, stock)
select p.id, s.size, c.color,
       v.code || '-' || upper(left(c.color, 3)) || '-' || s.size,
       greatest(0, v.base_stock + ((s.ord * 5 + c.ord * 3) % 9) - 3)
from (values
  ('charcoal-wool-two-piece-suit',      'CWS', array['38','40','42','44','46'], array['Charcoal'],           12),
  ('midnight-navy-three-piece-suit',    'MNT', array['38','40','42','44'],      array['Midnight Navy'],       9),
  ('slate-grey-glen-check-suit',        'SGC', array['38','40','42','44'],      array['Slate Grey'],          8),
  ('black-tuxedo-with-satin-lapel',     'BTX', array['38','40','42','44','46'], array['Black'],               7),
  ('navy-herringbone-blazer',           'NHB', array['38','40','42','44'],      array['Navy'],               14),
  ('olive-linen-blazer',                'OLB', array['38','40','42','44'],      array['Olive','Sand'],       10),
  ('camel-houndstooth-blazer',          'CHB', array['38','40','42','44'],      array['Camel'],              10),
  ('black-textured-cotton-blazer',      'BCB', array['38','40','42','44'],      array['Black'],              15),
  ('camel-overcoat',                    'COC', array['38','40','42','44'],      array['Camel'],               8),
  ('charcoal-wool-chesterfield-coat',   'CCH', array['38','40','42','44','46'], array['Charcoal'],            6),
  ('navy-peacoat',                      'NPC', array['38','40','42','44'],      array['Navy'],                9),
  ('grey-flannel-pleated-trousers',     'GFP', array['30','32','34','36','38'], array['Grey'],               16),
  ('navy-tapered-wool-trousers',        'NTW', array['30','32','34','36'],      array['Navy'],               18),
  ('beige-cotton-chinos',               'BCC', array['30','32','34','36','38'], array['Beige','Olive'],      20),
  ('charcoal-slim-fit-trousers',        'CST', array['30','32','34','36'],      array['Charcoal'],           14),
  ('slim-fit-oxford-shirt-in-white',    'OXW', array['S','M','L','XL','XXL'],   array['White'],              25),
  ('light-blue-poplin-shirt',           'LBP', array['S','M','L','XL'],         array['Light Blue'],         22),
  ('pink-striped-cotton-shirt',         'PSC', array['S','M','L','XL'],         array['Pink'],               18),
  ('navy-linen-shirt',                  'NLS', array['S','M','L','XL'],         array['Navy','Sage'],        16),
  ('ivory-tailored-dress-shirt',        'IDS', array['S','M','L','XL'],         array['Ivory'],              14)
) as v (slug, code, sizes, colors, base_stock)
join public.products p on p.slug = v.slug
cross join lateral unnest(v.sizes) with ordinality as s (size, ord)
cross join lateral unnest(v.colors) with ordinality as c (color, ord)
on conflict (sku) do nothing;
