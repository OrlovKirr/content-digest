-- Content Digest persistence (ADR 004, PLAN.md §Data model). One table.
-- Run idempotently by db.py when the connection pool is first created.
-- id is supplied by the API (uuid4 in Python), so no pgcrypto/gen_random_uuid
-- dependency on the database side.

CREATE TABLE IF NOT EXISTS cards (
    id          uuid PRIMARY KEY,
    url         text        NOT NULL DEFAULT '',
    title       text        NOT NULL DEFAULT '',
    summary     text        NOT NULL DEFAULT '',
    key_points  text[]      NOT NULL DEFAULT '{}',
    tags        text[]      NOT NULL DEFAULT '{}',
    category    text        NOT NULL DEFAULT 'Other',
    created_at  timestamptz NOT NULL DEFAULT now()
);

-- GET /api/cards returns newest-first.
CREATE INDEX IF NOT EXISTS cards_created_at_idx ON cards (created_at DESC);
