-- Renseigne le vrai dépôt GitHub du portfolio sur les bases déjà initialisées.
UPDATE projects
SET repo_url = 'https://github.com/vahinalaRalison/sasah-portfolio'
WHERE slug = 'sasah-portfolio';
