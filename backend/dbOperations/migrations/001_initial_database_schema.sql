CREATE TABLE users (
    user_id INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(128) NOT NULL,
    password VARCHAR(255) NOT NULL,
    
    PRIMARY KEY (user_id),
    UNIQUE KEY username_unique (username)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

CREATE TABLE shopping_lists (
    user_id INT NOT NULL,
    list_id INT NOT NULL AUTO_INCREMENT,
    list_name VARCHAR(128) NOT NULL,
    last_modified TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (list_id),
    KEY idx_shopping_lists_user_id (user_id),

    CONSTRAINT fk_shopping_lists_user_id
        FOREIGN KEY (user_id)
        REFERENCES users (user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

CREATE TABLE shopping_list_items (
    list_id INT NOT NULL,
    item_id INT NOT NULL AUTO_INCREMENT,
    item_name VARCHAR(255) NOT NULL,
    item_quantity INT NOT NULL,
    item_checked TINYINT(1) NOT NULL DEFAULT 0,
    item_pos_in_list INT NOT NULL DEFAULT 0,

    PRIMARY KEY (item_id),
    KEY idx_list_id_foreign_key (list_id),

    CONSTRAINT fk_list_id_foreign_key
        FOREIGN KEY (list_id)
        REFERENCES shopping_lists (list_id)
        ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;