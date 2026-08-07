ALTER TABLE shopping_lists
ADD COLUMN list_version INT UNSIGNED NOT NULL DEFAULT 1
AFTER last_modified;