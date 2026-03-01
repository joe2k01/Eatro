CREATE UNIQUE INDEX IF NOT EXISTS idx_manual_foods_name_brand
ON foods(name, COALESCE(brand, ''))
WHERE source = 1;
