-- Migration: Add child_age column to existing users table
-- Run this in your Supabase SQL Editor if you already have the users table

ALTER TABLE users ADD COLUMN IF NOT EXISTS child_age INTEGER;
