# Database Migrations

This folder contains SQL migration files for the Supabase database.

## How to Run Migrations

### Option 1: Supabase Dashboard (Recommended for Quick Fixes)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of the migration file
4. Paste into a new query
5. Click **Run** to execute

### Option 2: Supabase CLI

```bash
# Make sure you're logged in
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run the migration
supabase db push
```

### Option 3: Manual Migration via psql

```bash
psql YOUR_DATABASE_URL < migrations/001_make_colorings_user_id_nullable.sql
```

## Current Migrations

### 001_make_colorings_user_id_nullable.sql

**Purpose**: Fix database constraint error when saving colorings without user authentication

**Issue**: The `colorings` table has `user_id_fk` with NOT NULL constraint, but the app allows anonymous users (null user_id) to create colorings.

**Solution**: Make `user_id_fk` nullable to support anonymous usage during development/testing.

**Error Fixed**:
```
null value in column "user_id" of relation "colorings" violates not-null constraint
```

### 002_ensure_all_user_fks_nullable.sql ⭐ **RECOMMENDED**

**Purpose**: Comprehensive fix for anonymous user support across all tables

**What it does**:
- Makes `user_id_fk` nullable in both `storybooks` and `colorings` tables
- Adds performance indexes on `user_id_fk` columns
- Adds indexes on `created_at` for list queries
- Documents the nullable behavior with SQL comments

**Why use this**: This migration ensures consistent behavior across all tables and adds performance optimizations.

**Which migration should I run?**
- If you only have the coloring error: Run migration 001
- For a complete fix with optimizations: Run migration 002 (recommended)

## Notes

- Always backup your database before running migrations
- Test migrations in a development environment first
- Consider implementing proper authentication before production deployment
