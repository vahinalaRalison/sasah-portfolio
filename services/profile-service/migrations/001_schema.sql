CREATE TABLE IF NOT EXISTS profile (
    id         SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    full_name  TEXT NOT NULL,
    nickname   TEXT NOT NULL,
    title      TEXT NOT NULL,
    tagline    TEXT NOT NULL,
    bio        TEXT NOT NULL,
    location   TEXT NOT NULL,
    email      TEXT NOT NULL,
    links      JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS skills (
    id       SERIAL PRIMARY KEY,
    name     TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL CHECK (category IN ('backend', 'frontend', 'devops', 'database', 'architecture', 'soft')),
    level    SMALLINT NOT NULL CHECK (level BETWEEN 1 AND 5)
);

CREATE TABLE IF NOT EXISTS experiences (
    id         SERIAL PRIMARY KEY,
    company    TEXT NOT NULL,
    role       TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date   DATE,
    summary    TEXT NOT NULL,
    highlights TEXT[] NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_skills_category ON skills (category);
CREATE INDEX IF NOT EXISTS idx_experiences_start ON experiences (start_date DESC);
