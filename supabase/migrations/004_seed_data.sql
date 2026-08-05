-- ============================================================================
-- Misk Lume E-Commerce Platform — Seed Data (Development)
-- ============================================================================

-- ============================================================================
-- Categories
-- ============================================================================
insert into public.categories (name, slug, description, sort_order, image_url) values
  ('Men',     'men',     'Bold, woody, and sophisticated fragrances for men',     1, 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=600&q=80'),
  ('Women',   'women',   'Elegant, floral, and captivating fragrances for women',  2, 'https://images.unsplash.com/photo-1595425926237-29e265f1e8b3?w=600&q=80'),
  ('Unisex',  'unisex',  'Universal scents crafted for every soul',               3, 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&q=80'),
  ('Attar',   'attar',   'Traditional concentrated oil-based perfumes',           4, 'https://images.unsplash.com/photo-1615634260168-c54ea80a010c?w=600&q=80');

-- ============================================================================
-- Collections
-- ============================================================================
insert into public.collections (name, slug, description, image_url, price, original_price, sort_order) values
  (
    'The Noir Trio',
    'noir-trio',
    'Three of our most iconic fragrances — Noir Oud, Noir Saffron, and Noir Musk — presented together in an exclusive gift box. A complete scent wardrobe for the modern connoisseur.',
    'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80',
    9800, 12300, 1
  ),
  (
    'Rose Garden Set',
    'rose-garden',
    'A curated trio of our finest rose-based fragrances. From the dewy freshness of Rose Dawn to the deep richness of Velvet Rose, this set celebrates the world''s most beloved flower.',
    'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800&q=80',
    8500, 10700, 2
  ),
  (
    'The Discovery Kit',
    'discovery-kit',
    'New to Misk Lume? This kit includes six 2ml samples of our best-selling fragrances so you can find your signature scent before committing to a full bottle.',
    'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&q=80',
    3500, null, 3
  ),
  (
    'The Luxe Gift Box',
    'luxe-gift',
    'The ultimate gifting experience. A hand-crafted wooden box containing a full-size fragrance, a travel spray, and a scented candle — all wrapped in our signature packaging.',
    'https://images.unsplash.com/photo-1615634260168-c54ea80a010c?w=800&q=80',
     6500, null, 4
  );

-- ============================================================================
-- Blog Posts
-- ============================================================================
insert into public.blog_posts (title, slug, excerpt, content, category, author, image_url, is_published, views, published_at) values
  (
    'The Art of Layering Fragrances',
    'layering-fragrances',
    'Master the technique of combining scents to create a unique olfactory signature that''s entirely your own.',
    '## The Art of Layering Fragrances\n\nLayering fragrances is an art form that allows you to create a truly unique scent signature. By combining different perfumes, you can craft a fragrance that evolves throughout the day and reflects your personality.\n\n### Start with a Base\n\nBegin with a neutral or complementary base fragrance. This could be a subtle musk or a light citrus that provides a foundation for bolder notes to build upon.\n\n### Choose Complementary Notes\n\nLook for fragrances with complementary notes. Woody bases pair beautifully with floral or citrus top notes. Oriental scents work well with fresh, clean fragrances.\n\n### Layer from Heaviest to Lightest\n\nApply your heaviest, most intense fragrance first, then layer lighter scents on top. This allows each layer to shine while creating a balanced overall composition.\n\n### Experiment\n\nDon''t be afraid to experiment. Some of the most beautiful fragrance combinations come from unexpected pairings.',
    'Rituals',
    'Misk Lume',
    'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80',
    true, 1240, '2026-07-10 00:00:00+05'
  ),
  (
    'Oud: The Liquid Gold of Perfumery',
    'oud-liquid-gold',
    'Discover why oud has been treasured for centuries and what makes our sourcing process different.',
    '## Oud: The Liquid Gold of Perfumery\n\nOud, also known as agarwood, is one of the most precious and sought-after ingredients in perfumery. Its rich, complex aroma has been treasured for thousands of years.\n\n### What Makes Oud So Special?\n\nOud is formed when the agarwood tree becomes infected with a specific type of mold. In response, the tree produces a dark, fragrant resin that becomes increasingly aromatic over decades.\n\n### Our Sourcing Process\n\nAt Misk Lume, we source our oud from sustainable plantations in Assam and Cambodia. We work directly with local harvesters to ensure ethical practices and the highest quality.\n\n### The Scent Profile\n\nQuality oud has a complex profile that can include notes of leather, smoke, wood, and even subtle sweetness. It''s a fragrance that demands attention and rewards patience.',
    'Ingredients',
    'Misk Lume',
    'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80',
    true, 980, '2026-06-28 00:00:00+05'
  ),
  (
    'Your Guide to Attar Oils',
    'attar-oils-guide',
    'Everything you need to know about traditional attar oils, from application techniques to storage.',
    '## Your Guide to Attar Oils\n\nAttar oils are traditional perfume oils that have been crafted for centuries in the Middle East and South Asia. These concentrated oil-based fragrances offer a unique olfactory experience.\n\n### What Are Attars?\n\nAttars are natural perfume oils made through steam distillation of botanical materials. Unlike alcohol-based perfumes, attars are pure oil concentrates that last significantly longer on the skin.\n\n### Application Tips\n\nApply attar oil to pulse points — wrists, behind the ears, and the base of the throat. The warmth of these areas helps the fragrance develop and project beautifully.\n\n### Storage\n\nStore attar oils in a cool, dark place away from direct sunlight. Properly stored, attars can last for decades and even improve with age.',
    'Fragrance Guides',
    'Misk Lume',
    'https://images.unsplash.com/photo-1615634260168-c54ea80a010c?w=800&q=80',
    true, 756, '2026-06-15 00:00:00+05'
  ),
  (
    'Understanding Fragrance Notes: Top, Heart & Base',
    'fragrance-notes',
    'A beginner''s guide to the architecture of perfume and how scent evolves on your skin over time.',
    '## Understanding Fragrance Notes\n\nEvery perfume is composed of three layers of notes that unfold over time: the top notes, heart notes, and base notes. Understanding this architecture helps you appreciate the craft behind each fragrance.\n\n### Top Notes (The Opening)\n\nTop notes are the first impression — light, volatile molecules that evaporate quickly. Citrus, light fruits, and fresh herbs are common top notes. They last about 15-30 minutes.\n\n### Heart Notes (The Soul)\n\nHeart notes emerge as the top notes fade. These form the core of the fragrance and last 2-4 hours. Floral, spicy, and fruity notes are typical heart notes.\n\n### Base Notes (The Foundation)\n\nBase notes are the foundation — rich, heavy molecules that last the longest. Woods, resins, musks, and vanillas provide depth and longevity, lasting 6+ hours.',
    'Fragrance Guides',
    'Misk Lume',
    'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&q=80',
    true, 2100, '2026-06-01 00:00:00+05'
  ),
  (
    'The History of Oud: From Ancient Temples to Modern Perfumery',
    'history-of-oud',
    'Oud has been treasured for thousands of years, from the incense-filled temples of ancient Egypt to the sophisticated ateliers of modern perfumery.',
    '## The History of Oud\n\nOud has been treasured for thousands of years, from the incense-filled temples of ancient Egypt to the sophisticated ateliers of modern perfumery. This rare ingredient, born from the heart of the agarwood tree, carries with it centuries of tradition, spirituality, and unmatched olfactory richness.\n\n### Ancient Origins\n\nThe use of oud dates back over 3,000 years. In ancient Egypt, it was used in religious ceremonies and burial rites. In Ayurvedic tradition, oud was prized for its medicinal properties.\n\n### The Silk Road\n\nOud traveled along the Silk Road, becoming a prized commodity in the courts of emperors and kings. It was often worth more than gold.\n\n### Modern Perfumery\n\nToday, oud is experiencing a renaissance in Western perfumery. Master perfumers are incorporating this ancient ingredient into modern compositions, creating fragrances that bridge tradition and innovation.',
    'Ingredients',
    'Misk Lume',
    'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80',
    true, 3200, '2026-05-15 00:00:00+05'
  ),
  (
    'Choosing the Perfect Winter Fragrance',
    'winter-fragrance',
    'Discover rich, warming scents that complement the colder months and leave a lasting impression.',
    '## Choosing the Perfect Winter Fragrance\n\nWinter is the season for rich, enveloping fragrances. The cold weather calls for scents that warm the soul and leave a lasting impression.\n\n### Look for Warm Notes\n\nWinter fragrances typically feature warm notes like amber, vanilla, oud, leather, and spices. These ingredients create a cozy, comforting aura.\n\n### Consider Concentration\n\nIn winter, you can wear higher concentrations like parfum or extrait de parfum. The cold weather slows evaporation, allowing heavier formulations to perform beautifully.\n\n### Our Top Picks\n\nFor winter, we recommend Noir Oud for its deep, smoky warmth, Saffron Ember for its rich spice, and Tobacco Roi for its luxurious, honeyed tobacco.',
    'Fragrance Guides',
    'Misk Lume',
    'https://images.unsplash.com/photo-1595425926237-29e265f1e8b3?w=800&q=80',
    true, 645, '2026-04-20 00:00:00+05'
  );

-- ============================================================================
-- Discount Codes
-- ============================================================================
insert into public.discount_codes (code, type, value, min_order, usage_limit, is_active, expires_at) values
  ('RITUAL15',  'percentage', 15, 0,    100, true, '2027-12-31 23:59:59+05'),
  ('WELCOME10', 'percentage', 10, 2000, 500, true, '2027-12-31 23:59:59+05');

-- ============================================================================
-- Default Settings
-- ============================================================================
insert into public.settings (key, value) values
  ('store_name',         '"Misk Lume"'),
  ('store_tagline',      '"The Art of Distinction"'),
  ('currency',           '"PKR"'),
  ('currency_symbol',    '"PKR"'),
  ('shipping_cost',      '200'),
  ('free_shipping_min',  '8000'),
  ('bank_name',          '"Meezan Bank"'),
  ('bank_account_title', '"Misk Lume (Pvt) Ltd"'),
  ('bank_account_no',    '"0123-0101-2345678-01"'),
  ('bank_iban',          '"PK90MEZN0001230101234567801"'),
  ('email_contact',      '"hello@misklume.com"'),
  ('phone_contact',      '"+92 300 1234567"'),
  ('address',            '"Lahore, Pakistan"'),
  ('social_instagram',   '"@misklume"'),
  ('social_facebook',    '"MiskLume"'),
  ('maintenance_mode',   'false');

-- ============================================================================
-- Reviews
-- ============================================================================
-- No seeded reviews. All reviews are written by real authenticated customers
-- through the storefront and approved by admins. Ratings and review counts are
-- kept in sync automatically by the update_product_rating trigger.
