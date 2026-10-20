-- Renseigne le vrai lien GitHub sur les bases déjà initialisées avec le seed générique.
UPDATE profile
SET links = (
    SELECT jsonb_agg(
        CASE WHEN l->>'label' = 'GitHub' THEN jsonb_set(l, '{url}', '"https://github.com/vahinalaRalison"') ELSE l END
    )
    FROM jsonb_array_elements(links) AS l
),
    updated_at = now()
WHERE id = 1;
