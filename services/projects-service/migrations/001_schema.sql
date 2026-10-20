CREATE TABLE IF NOT EXISTS projects (
    id          SERIAL PRIMARY KEY,
    slug        TEXT NOT NULL UNIQUE,
    name        TEXT NOT NULL,
    tagline     TEXT NOT NULL,
    description TEXT NOT NULL,
    stack       TEXT[] NOT NULL DEFAULT '{}',
    repo_url    TEXT,
    live_url    TEXT,
    year        SMALLINT NOT NULL,
    featured    BOOLEAN NOT NULL DEFAULT false,
    emoji       TEXT NOT NULL DEFAULT '✨',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_featured_year ON projects (featured DESC, year DESC);
