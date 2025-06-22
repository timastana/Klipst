-- Manual database setup script
-- Run this if you prefer to set up the database manually

-- Create the database (run this as postgres superuser)
CREATE DATABASE klipst_db;

-- Create a user for the application
CREATE USER klipst_user WITH PASSWORD 'your_secure_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE klipst_db TO klipst_user;

-- Connect to the klipst_db database
\c klipst_db;

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO klipst_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO klipst_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO klipst_user;

-- Enable UUID extension (optional, for better IDs)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- The tables will be created automatically by Prisma
-- when you run: npx prisma db push
