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
-- Products
-- ============================================================================
insert into public.products (name, slug, description, short_description, category_id, gender, price, sale_price, sku, stock_quantity, is_featured, badge, image_url, rating, review_count) values
  (
    'Noir Oud',
    'noir-oud',
    'Noir Oud is a masterful composition that draws from the ancient art of oud distillation. Sourced from the finest agarwood forests of Assam, each drop carries the depth of centuries-old tradition reimagined for the modern connoisseur.

The opening is bold — a cascade of crushed black pepper intertwined with sun-drenched bergamot, creating an invigorating burst that commands attention. As the scent settles, a heart of aged oud and earthy vetiver emerges, weaving a complex tapestry of smoky, woody richness.

The dry-down is where Noir Oud truly reveals its soul. A velvety blanket of amber and creamy sandalwood lingers on the skin for hours, leaving an unforgettable trail that speaks of quiet confidence and refined taste.',
    'A deep, intoxicating blend of rare oud wood and smoky black pepper, grounded by warm amber and sandalwood. This unisex attar embodies mystery and sophistication.',
    (select id from public.categories where slug = 'unisex'),
    'unisex', 4500, null, 'ML-NO-001', 8, true, 'new',
    'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80',
    5.00, 128
  ),
  (
    'Velvet Rose',
    'velvet-rose',
    'Velvet Rose captures the essence of Damascena roses at dawn, when their petals are still heavy with morning dew. This fragrance is a love letter to timeless femininity.

The opening is a lush burst of Turkish rose and wild berries, vibrant and intoxicating. As it evolves, a heart of velvety rose absolute deepens, enriched by subtle oud undertones that add complexity and mystery.

The base of vanilla, musk, and soft sandalwood provides a warm, sensual foundation that makes Velvet Rose perfect for both daytime elegance and evening allure.',
    'An opulent rose attar blended with dark berries and a whisper of oud, designed for the modern woman who embraces elegance.',
    (select id from public.categories where slug = 'women'),
    'women', 3800, 3200, 'ML-VR-002', 15, true, 'new',
    'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80',
    4.80, 94
  ),
  (
    'Amber Savage',
    'amber-savage',
    'Amber Savage is a warm, enveloping fragrance that captures the untamed spirit of the wild. Rich amber meets smoky vetiver and a whisper of leather for a scent that is both primal and refined.

The opening is a burst of saffron and pink pepper, spicy and intriguing. The heart reveals a rich blend of amber resin and labdanum, deep and honeyed. The base settles into a warm embrace of leather, musk, and tonka bean.',
    'A warm, untamed blend of amber, smoky vetiver, and leather for those who dare to stand out.',
    (select id from public.categories where slug = 'unisex'),
    'unisex', 3200, 4000, 'ML-AS-003', 20, true, 'sale',
    'https://images.unsplash.com/photo-1595425926237-29e265f1e8b3?w=800&q=80',
    4.00, 76
  ),
  (
    'Saffron Ember',
    'saffron-ember',
    'Saffron Ember is a bold, warm composition that centers on the most precious spice in the world. Golden saffron threads intertwine with smoky oud and rich amber for a fragrance that radiates warmth and sophistication.

The opening is a luminous burst of saffron and bitter orange, bright and captivating. The heart reveals a complex blend of oud, rose, and cinnamon. The base is a warm, lingering embrace of amber, musk, and sandalwood.',
    'A bold composition of golden saffron, smoky oud, and rich amber — warm, sophisticated, and unforgettable.',
    (select id from public.categories where slug = 'men'),
    'men', 5200, null, 'ML-SE-004', 12, true, null,
    'https://images.unsplash.com/photo-1615634260168-c54ea80a010c?w=800&q=80',
    5.00, 63
  ),
  (
    'Cedarwood Atlas',
    'cedarwood-atlas',
    'Cedarwood Atlas is a grounding, woody fragrance inspired by the ancient cedar forests of the Atlas Mountains. Crisp cedarwood is layered with earthy vetiver and a touch of citrus for a scent that is both fresh and profound.

The opening is bright and invigorating with notes of grapefruit and juniper berries. The heart reveals the majestic Atlas cedarwood, resinous and warm. The base is anchored by vetiver, patchouli, and a hint of moss.',
    'A grounding woody fragrance inspired by the cedar forests of the Atlas Mountains — fresh, crisp, and profound.',
    (select id from public.categories where slug = 'men'),
    'men', 2800, null, 'ML-CA-005', 25, false, null,
    'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&q=80',
    4.00, 51
  ),
  (
    'Iris Dusk',
    'iris-dusk',
    'Iris Dusk is a sophisticated floral fragrance that captures the quiet beauty of twilight. Powdery iris petals blend with violet and soft musk for an elegant, introspective scent.

The opening is a delicate dance of violet leaf and bergamot. The heart reveals the Queen of Flowers — iris in all its powdery, elegant glory, softened by heliotrope. The base is a gentle caress of musk, sandalwood, and vanilla.',
    'A sophisticated floral of powdery iris, violet, and soft musk — capturing the quiet beauty of twilight.',
    (select id from public.categories where slug = 'women'),
    'women', 4200, null, 'ML-ID-006', 18, false, null,
    'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80',
    5.00, 87
  ),
  (
    'Tobacco Roi',
    'tobacco-roi',
    'Tobacco Roi is a rich, sophisticated fragrance that celebrates the noble leaf. Sweet honeyed tobacco is wrapped in warm spices and dark leather for a scent of regal elegance.

The opening is a rich interplay of plum and cinnamon, sweet and spicy. The heart reveals the finest tobacco absolute, honeyed and slightly smoky. The base is a luxurious blend of leather, oud, and amber.',
    'A rich, regal blend of honeyed tobacco, warm spices, and dark leather — sophisticated and commanding.',
    (select id from public.categories where slug = 'men'),
    'men', 3500, null, 'ML-TR-007', 10, false, null,
    'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80',
    4.00, 42
  ),
  (
    'Musk Absolute',
    'musk-absolute',
    'Musk Absolute is a pure, sensual fragrance that celebrates the primal allure of clean musk. White musk is layered with ambrette seed and a whisper of jasmine for a scent that is both innocent and intoxicating.

The opening is fresh and luminous with pear and white florals. The heart is a bouquet of jasmine, orange blossom, and ylang-ylang. The base is a warm, intimate embrace of white musk, ambrette, and creamy sandalwood.',
    'A pure, sensual musk fragrance — clean, intimate, and utterly captivating.',
    (select id from public.categories where slug = 'unisex'),
    'unisex', 3000, null, 'ML-MA-008', 30, false, null,
    'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800&q=80',
    4.00, 68
  ),
  (
    'Jasmine Noir',
    'jasmine-noir',
    'Jasmine Noir is a dark, intoxicating floral that reveals the nocturnal side of jasmine. Night-blooming jasmine absolute is shadowed by black tea, dark berries, and a veil of incense.

The opening is a burst of blackcurrant and bergamot, tart and bright. The heart unveils the star — jasmine grandiflorum, rich and indolic, deepened by black tea. The base is a mystical blend of incense, patchouli, and vanilla.',
    'A dark, intoxicating jasmine fragrance with black tea, dark berries, and incense — mysterious and alluring.',
    (select id from public.categories where slug = 'women'),
    'women', 4800, null, 'ML-JN-009', 7, true, 'new',
    'https://images.unsplash.com/photo-1595425926237-29e265f1e8b3?w=800&q=80',
    5.00, 35
  );

-- ============================================================================
-- Product Sizes
-- ============================================================================
insert into public.product_sizes (product_id, size_ml, price, stock_quantity, sku, is_active)
select id, 6,   price,      least(stock_quantity + 5, 30), sku || '-6ML',  true from public.products
union all
select id, 12,  price + 500, stock_quantity,               sku || '-12ML', true from public.products
union all
select id, 25,  price + 1200, greatest(stock_quantity - 3, 0), sku || '-25ML', true from public.products;

-- ============================================================================
-- Fragrance Notes
-- ============================================================================
-- Noir Oud
insert into public.fragrance_notes (product_id, note_type, name, description)
select id, 'top',    'Black Pepper & Bergamot', 'A sharp, energizing opening that awakens the senses with warm spice and bright citrus zest.'   from public.products where slug = 'noir-oud';
insert into public.fragrance_notes (product_id, note_type, name, description)
select id, 'middle', 'Oud & Vetiver',           'The intoxicating heart of aged agarwood and smoky vetiver forms the soul of this composition.'       from public.products where slug = 'noir-oud';
insert into public.fragrance_notes (product_id, note_type, name, description)
select id, 'base',   'Amber & Sandalwood',      'A warm, enveloping base that lingers for hours — rich amber softened by creamy sandalwood.'        from public.products where slug = 'noir-oud';

-- Velvet Rose
insert into public.fragrance_notes (product_id, note_type, name, description)
select id, 'top',    'Rose & Wild Berries',     'Fresh Damascena rose petals meet a burst of wild berries for a vibrant, feminine opening.'        from public.products where slug = 'velvet-rose';
insert into public.fragrance_notes (product_id, note_type, name, description)
select id, 'middle', 'Oud & Geranium',          'Rose absolute intertwines with geranium and a touch of oud for a rich, complex heart.'            from public.products where slug = 'velvet-rose';
insert into public.fragrance_notes (product_id, note_type, name, description)
select id, 'base',   'Vanilla & Musk',           'Warm vanilla and soft musk create a sensual, lingering finish.'                                    from public.products where slug = 'velvet-rose';

-- Amber Savage
insert into public.fragrance_notes (product_id, note_type, name, description)
select id, 'top',    'Saffron & Pink Pepper',    'Spicy, intriguing opening that immediately commands attention.'                                    from public.products where slug = 'amber-savage';
insert into public.fragrance_notes (product_id, note_type, name, description)
select id, 'middle', 'Amber & Labdanum',         'Deep, honeyed heart of rich amber resin and warm labdanum.'                                        from public.products where slug = 'amber-savage';
insert into public.fragrance_notes (product_id, note_type, name, description)
select id, 'base',   'Leather & Tonka',          'A warm embrace of leather, musk, and tonka bean that lingers on the skin.'                       from public.products where slug = 'amber-savage';

-- Saffron Ember
insert into public.fragrance_notes (product_id, note_type, name, description)
select id, 'top',    'Saffron & Bitter Orange',  'A luminous, bright opening of golden saffron and bitter orange.'                                  from public.products where slug = 'saffron-ember';
insert into public.fragrance_notes (product_id, note_type, name, description)
select id, 'middle', 'Oud & Rose',               'A complex heart of smoky oud, rose, and warm cinnamon.'                                           from public.products where slug = 'saffron-ember';
insert into public.fragrance_notes (product_id, note_type, name, description)
select id, 'base',   'Amber & Sandalwood',       'Warm, lingering embrace of amber, musk, and creamy sandalwood.'                                   from public.products where slug = 'saffron-ember';

-- Cedarwood Atlas
insert into public.fragrance_notes (product_id, note_type, name, description)
select id, 'top',    'Grapefruit & Juniper',     'Bright and invigorating citrus opening with crisp juniper berries.'                               from public.products where slug = 'cedarwood-atlas';
insert into public.fragrance_notes (product_id, note_type, name, description)
select id, 'middle', 'Atlas Cedarwood',          'The majestic heart — resinous, warm Atlas cedarwood in all its glory.'                            from public.products where slug = 'cedarwood-atlas';
insert into public.fragrance_notes (product_id, note_type, name, description)
select id, 'base',   'Vetiver & Moss',           'Anchored by earthy vetiver, patchouli, and a hint of oakmoss.'                                     from public.products where slug = 'cedarwood-atlas';

-- Iris Dusk
insert into public.fragrance_notes (product_id, note_type, name, description)
select id, 'top',    'Violet Leaf & Bergamot',   'A delicate, elegant opening of violet leaf and bright bergamot.'                                  from public.products where slug = 'iris-dusk';
insert into public.fragrance_notes (product_id, note_type, name, description)
select id, 'middle', 'Iris & Heliotrope',        'The queen of flowers — powdery iris softened by sweet heliotrope.'                                from public.products where slug = 'iris-dusk';
insert into public.fragrance_notes (product_id, note_type, name, description)
select id, 'base',   'Musk & Vanilla',           'A gentle, warm caress of soft musk, sandalwood, and vanilla.'                                    from public.products where slug = 'iris-dusk';

-- Tobacco Roi
insert into public.fragrance_notes (product_id, note_type, name, description)
select id, 'top',    'Plum & Cinnamon',          'Sweet and spicy — ripe plum meets warm cinnamon in a rich opening.'                              from public.products where slug = 'tobacco-roi';
insert into public.fragrance_notes (product_id, note_type, name, description)
select id, 'middle', 'Tobacco Absolute',         'The finest honeyed tobacco, slightly smoky and deeply luxurious.'                                from public.products where slug = 'tobacco-roi';
insert into public.fragrance_notes (product_id, note_type, name, description)
select id, 'base',   'Leather & Oud',            'A regal foundation of dark leather, oud, and warm amber.'                                        from public.products where slug = 'tobacco-roi';

-- Musk Absolute
insert into public.fragrance_notes (product_id, note_type, name, description)
select id, 'top',    'Pear & White Florals',     'Fresh and luminous opening with juicy pear and delicate white flowers.'                          from public.products where slug = 'musk-absolute';
insert into public.fragrance_notes (product_id, note_type, name, description)
select id, 'middle', 'Jasmine & Orange Blossom', 'A rich floral bouquet of jasmine, orange blossom, and ylang-ylang.'                              from public.products where slug = 'musk-absolute';
insert into public.fragrance_notes (product_id, note_type, name, description)
select id, 'base',   'White Musk & Sandalwood',  'Warm, intimate base of white musk, ambrette seed, and creamy sandalwood.'                       from public.products where slug = 'musk-absolute';

-- Jasmine Noir
insert into public.fragrance_notes (product_id, note_type, name, description)
select id, 'top',    'Blackcurrant & Bergamot',  'Tart and bright — blackcurrant and bergamot create a luminous opening.'                            from public.products where slug = 'jasmine-noir';
insert into public.fragrance_notes (product_id, note_type, name, description)
select id, 'middle', 'Jasmine & Black Tea',      'The star — rich jasmine grandiflorum deepened by smoky black tea.'                               from public.products where slug = 'jasmine-noir';
insert into public.fragrance_notes (product_id, note_type, name, description)
select id, 'base',   'Incense & Patchouli',      'A mystical veil of incense, dark patchouli, and warm vanilla.'                                    from public.products where slug = 'jasmine-noir';

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
-- Collection Products
-- ============================================================================
-- Noir Trio: Noir Oud + Saffron Ember + Tobacco Roi
insert into public.collection_products (collection_id, product_id)
select c.id, p.id
from public.collections c, public.products p
where c.slug = 'noir-trio' and p.slug in ('noir-oud', 'saffron-ember', 'tobacco-roi');

-- Rose Garden Set: Velvet Rose + Jasmine Noir + Iris Dusk
insert into public.collection_products (collection_id, product_id)
select c.id, p.id
from public.collections c, public.products p
where c.slug = 'rose-garden' and p.slug in ('velvet-rose', 'jasmine-noir', 'iris-dusk');

-- Discovery Kit: all products
insert into public.collection_products (collection_id, product_id)
select c.id, p.id
from public.collections c, public.products p
where c.slug = 'discovery-kit';

-- Luxe Gift Box: Noir Oud + Velvet Rose
insert into public.collection_products (collection_id, product_id)
select c.id, p.id
from public.collections c, public.products p
where c.slug = 'luxe-gift' and p.slug in ('noir-oud', 'velvet-rose');

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
-- Sample Reviews
-- ============================================================================
-- Reviews for Noir Oud
insert into public.reviews (product_id, rating, title, text, user_id, is_approved, is_verified, created_at)
select p.id, 5, 'Absolutely mesmerizing', 'The oud is deep and authentic — not synthetic at all. Lasts a full 12 hours on my skin. This is the real deal.', null, true, true, '2026-06-15 00:00:00+05'
from public.products p where p.slug = 'noir-oud';

insert into public.reviews (product_id, rating, title, text, user_id, is_approved, is_verified, created_at)
select p.id, 5, 'Top 3 in my collection', 'I have been collecting attars for over a decade, and Noir Oud is easily in my top 3. The pepper opening is stunning, and the amber dry-down is pure luxury.', null, true, true, '2026-05-20 00:00:00+05'
from public.products p where p.slug = 'noir-oud';

insert into public.reviews (product_id, rating, title, text, user_id, is_approved, is_verified, created_at)
select p.id, 5, 'Worth every rupee', 'Noir Oud is unlike anything I have ever experienced. The longevity is incredible — 12 hours and still getting compliments.', null, true, true, '2026-06-01 00:00:00+05'
from public.products p where p.slug = 'noir-oud';

-- Reviews for Velvet Rose
insert into public.reviews (product_id, rating, title, text, user_id, is_approved, is_verified, created_at)
select p.id, 5, 'My signature scent', 'Velvet Rose has become my signature scent. The rose and oud blend is perfectly balanced. My husband bought this for me and I am obsessed.', null, true, true, '2026-05-10 00:00:00+05'
from public.products p where p.slug = 'velvet-rose';

insert into public.reviews (product_id, rating, title, text, user_id, is_approved, is_verified, created_at)
select p.id, 4, 'Elegant and feminine', 'Beautiful fragrance that lasts all day. The rose is prominent but not overpowering. Perfect for both day and evening wear.', null, true, true, '2026-04-15 00:00:00+05'
from public.products p where p.slug = 'velvet-rose';

-- Review for Saffron Ember
insert into public.reviews (product_id, rating, title, text, user_id, is_approved, is_verified, created_at)
select p.id, 4, 'Bold and sophisticated', 'The packaging alone feels luxurious. Saffron Ember is bold, warm, and sophisticated. Misk Lume has set a new standard for Pakistani perfumery.', null, true, true, '2026-04-01 00:00:00+05'
from public.products p where p.slug = 'saffron-ember';

-- Recalculate ratings based on seeded reviews
do $$
declare
  r record;
begin
  for r in (select distinct product_id from public.reviews where is_approved = true) loop
    update public.products
    set
      rating = coalesce(
        (select round(avg(rating::numeric), 2) from public.reviews where product_id = r.product_id and is_approved = true),
        0
      ),
      review_count = (select count(*) from public.reviews where product_id = r.product_id and is_approved = true)
    where id = r.product_id;
  end loop;
end;
$$;
