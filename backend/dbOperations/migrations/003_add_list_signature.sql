ALTER TABLE shopping_lists
ADD COLUMN list_signature VARCHAR(128)
AFTER list_version;