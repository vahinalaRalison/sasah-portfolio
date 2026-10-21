-- CV (PDF) téléchargeable, stocké en base : un seul fichier, remplacé à chaque envoi depuis l'admin.
CREATE TABLE IF NOT EXISTS profile_cv (
    id         SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    filename   TEXT NOT NULL,
    content    BYTEA NOT NULL,
    size       INTEGER NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
