INSERT INTO profile (id, full_name, nickname, title, tagline, bio, location, email, links) VALUES (
    1,
    'Sarah Mendrika',
    'Sasah',
    'Développeuse Fullstack Senior',
    'Des microservices robustes, des interfaces qui brillent ✨',
    'Développeuse fullstack senior, je conçois des plateformes métier complètes : architectures microservices, '
    'API Laravel et Node.js, fronts React/TypeScript, conteneurisation Docker et déploiements automatisés. '
    'J''applique systématiquement les normes de code et les design patterns pour livrer des applications rapides, '
    'maintenables et sans régression.',
    'France',
    'sarah@platinium.care',
    '[
        {"label": "GitHub",   "url": "https://github.com/vahinalaRalison"},
        {"label": "GitLab",   "url": "https://gitlab.com/sarah-rxg"},
        {"label": "LinkedIn", "url": "https://www.linkedin.com/"}
    ]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO skills (name, category, level) VALUES
    ('PHP / Laravel',            'backend',      5),
    ('Node.js / TypeScript',     'backend',      4),
    ('API REST & JWT / Sanctum', 'backend',      5),
    ('WebSockets (Reverb, Soketi)', 'backend',   4),
    ('React / TypeScript',       'frontend',     5),
    ('Redux Toolkit / Zustand',  'frontend',     4),
    ('Tailwind CSS',             'frontend',     5),
    ('Vite',                     'frontend',     4),
    ('React Hook Form / Zod',    'frontend',     4),
    ('Docker / Docker Compose',  'devops',       5),
    ('Kubernetes',               'devops',       3),
    ('Nginx / TLS',              'devops',       4),
    ('CI/CD (GitHub, GitLab)',   'devops',       4),
    ('Monitoring & sauvegardes', 'devops',       4),
    ('PostgreSQL',               'database',     5),
    ('MySQL',                    'database',     4),
    ('MinIO / S3',               'database',     4),
    ('Microservices',            'architecture', 5),
    ('Design patterns',          'architecture', 5),
    ('API Gateway / RabbitMQ',   'architecture', 4),
    ('Clean code & revues',      'soft',         5),
    ('Documentation technique',  'soft',         4)
ON CONFLICT (name) DO NOTHING;

INSERT INTO experiences (company, role, start_date, end_date, summary, highlights)
SELECT * FROM (VALUES
    ('Groupe RXG — Platinium Care', 'Lead développeuse fullstack', DATE '2024-01-01', NULL,
     'Conception et pilotage de la plateforme RXG : 8 applications, 23 services back-end, 800 endpoints, communication inter-services via passerelles et RabbitMQ.',
     ARRAY['Architecture microservices Laravel derrière des passerelles nginx',
           'Fronts React/TypeScript (back-office, agents, livreurs)',
           'PostgreSQL, MinIO, temps réel Reverb/Soketi',
           'Infrastructure Docker, sauvegardes automatisées, monitoring, veille sécurité']),
    ('Squadex', 'Développeuse fullstack', DATE '2023-01-01', DATE '2023-12-01',
     'Back-office Laravel et site vitrine avec espace syndic : gestion des interventions, notifications temps réel, exports PDF/Excel.',
     ARRAY['Laravel Sanctum, Soketi, IMAP', 'React, Redux Toolkit, jsPDF, xlsx', 'Docker Compose local et production']),
    ('Dreamland — SIRH', 'Développeuse fullstack', DATE '2022-01-01', DATE '2022-12-01',
     'SIRH complet (Platinium RH) : onboarding, planning, paie, documents, i18n.',
     ARRAY['Laravel Reverb, JWT, PhpSpreadsheet, Dompdf', 'React, i18next, Zustand', 'Postfix local, Resend en production'])
) AS v(company, role, start_date, end_date, summary, highlights)
WHERE NOT EXISTS (SELECT 1 FROM experiences);
