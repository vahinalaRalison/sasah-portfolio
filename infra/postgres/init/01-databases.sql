-- Database per service : une base isolée par microservice.
-- Exécuté une seule fois par l'image postgres à l'initialisation du volume.
CREATE DATABASE profile_db;
CREATE DATABASE projects_db;
CREATE DATABASE contact_db;
