-- Store settings key-value table
create table if not exists store_settings (
  key text primary key,
  value text not null,
  updated_at timestamp with time zone default now()
);

insert into store_settings (key, value) values
  ('store_name', 'Misk Lume'),
  ('store_description', 'Luxury fragrances crafted with the finest ingredients from the heart of the East.'),
  ('contact_email', 'misklume@gmail.com'),
  ('contact_phone', '+92 325 8685580'),
  ('shipping_rate', '200'),
  ('free_shipping_threshold', '8000'),
  ('delivery_estimate', '5-6 business days'),
  ('bank_name', 'Meezan Bank'),
  ('account_title', 'Misk Lume (Pvt) Ltd'),
  ('account_number', '0123-0101-2345678-01'),
  ('iban', 'PK90MEZN0001230101234567801')
on conflict (key) do nothing;
