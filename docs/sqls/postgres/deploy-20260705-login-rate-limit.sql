CREATE TABLE IF NOT EXISTS adm_login_rate_limit (
    client_key varchar(128) PRIMARY KEY,
    failure_count integer NOT NULL DEFAULT 0,
    window_started_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    blocked_until_at timestamp(6),
    created_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE adm_login_rate_limit
    ADD COLUMN IF NOT EXISTS failure_count integer NOT NULL DEFAULT 0;

ALTER TABLE adm_login_rate_limit
    ADD COLUMN IF NOT EXISTS window_started_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE adm_login_rate_limit
    ADD COLUMN IF NOT EXISTS blocked_until_at timestamp(6);

ALTER TABLE adm_login_rate_limit
    ADD COLUMN IF NOT EXISTS created_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE adm_login_rate_limit
    ADD COLUMN IF NOT EXISTS updated_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
          FROM pg_constraint
         WHERE conname = 'ck_adm_login_rate_limit_count'
    ) THEN
        ALTER TABLE adm_login_rate_limit
            ADD CONSTRAINT ck_adm_login_rate_limit_count
            CHECK (failure_count >= 0);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_adm_login_rate_limit_01
    ON adm_login_rate_limit (blocked_until_at);

CREATE INDEX IF NOT EXISTS idx_adm_login_rate_limit_02
    ON adm_login_rate_limit (updated_at, blocked_until_at);
