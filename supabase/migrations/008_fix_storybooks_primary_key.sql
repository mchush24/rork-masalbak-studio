-- Migration: Fix storybooks table with correct primary key
-- Description: Drop wrong composite primary key and recreate correctly

-- =====================================================
-- STEP 1: FIX STORYBOOKS PRIMARY KEY
-- =====================================================

-- Drop the incorrect composite primary key
ALTER TABLE public.storybooks DROP CONSTRAINT IF EXISTS storybooks_pkey;

-- Add correct primary key (only id)
ALTER TABLE public.storybooks ADD PRIMARY KEY (id);

-- =====================================================
-- STEP 2: FIX STORYBOOKS COLUMNS
-- =====================================================

-- 1. Make pdf_url nullable (it can be null if PDF generation fails)
ALTER TABLE public.storybooks
ALTER COLUMN pdf_url DROP NOT NULL;

-- 2. Convert voice_urls from JSONB to TEXT[] array
-- First, check if voice_urls is JSONB type
DO $$
BEGIN
    -- Add temporary column
    ALTER TABLE public.storybooks
    ADD COLUMN IF NOT EXISTS voice_urls_new TEXT[];

    -- Copy and convert data (JSONB array to TEXT array)
    UPDATE public.storybooks
    SET voice_urls_new = ARRAY(SELECT jsonb_array_elements_text(voice_urls::jsonb))
    WHERE voice_urls IS NOT NULL;

    -- Drop old column and rename new one
    ALTER TABLE public.storybooks DROP COLUMN voice_urls;
    ALTER TABLE public.storybooks RENAME COLUMN voice_urls_new TO voice_urls;
EXCEPTION
    WHEN OTHERS THEN
        -- If voice_urls is already TEXT[], do nothing
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'storybooks'
            AND column_name = 'voice_urls_new'
        ) THEN
            RAISE NOTICE 'voice_urls is already TEXT[] type';
        END IF;
END$$;

-- 3. Remove old user_id column if exists (we use user_id_fk now)
ALTER TABLE public.storybooks DROP COLUMN IF EXISTS user_id;

-- 4. Add updated_at if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'storybooks'
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.storybooks
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW());
    END IF;
END$$;

-- =====================================================
-- STEP 3: FIX/CREATE COLORINGS TABLE
-- =====================================================

-- Check if colorings table exists
DO $$
BEGIN
    -- If table doesn't exist, create it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'colorings'
    ) THEN
        CREATE TABLE public.colorings (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id_fk UUID REFERENCES public.users(id) ON DELETE CASCADE,
            title TEXT NOT NULL DEFAULT 'Boyama Sayfası',
            coloring_image_url TEXT NOT NULL,
            pdf_url TEXT,
            page_count INTEGER DEFAULT 1,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
        );

        RAISE NOTICE 'Created colorings table';
    ELSE
        -- Table exists, ensure columns are correct
        -- Add missing columns if they don't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'colorings'
            AND column_name = 'coloring_image_url'
        ) THEN
            ALTER TABLE public.colorings
            ADD COLUMN coloring_image_url TEXT;
            RAISE NOTICE 'Added coloring_image_url column';
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'colorings'
            AND column_name = 'page_count'
        ) THEN
            ALTER TABLE public.colorings
            ADD COLUMN page_count INTEGER DEFAULT 1;
            RAISE NOTICE 'Added page_count column';
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'colorings'
            AND column_name = 'updated_at'
        ) THEN
            ALTER TABLE public.colorings
            ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW());
            RAISE NOTICE 'Added updated_at column';
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'colorings'
            AND column_name = 'title'
        ) THEN
            ALTER TABLE public.colorings
            ADD COLUMN title TEXT NOT NULL DEFAULT 'Boyama Sayfası';
            RAISE NOTICE 'Added title column';
        END IF;

        RAISE NOTICE 'Updated colorings table';
    END IF;
END$$;

-- =====================================================
-- STEP 4: ENSURE RLS POLICIES EXIST
-- =====================================================

-- Enable RLS
ALTER TABLE public.storybooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colorings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to recreate them)
DROP POLICY IF EXISTS "Users can view their own storybooks" ON public.storybooks;
DROP POLICY IF EXISTS "Users can insert their own storybooks" ON public.storybooks;
DROP POLICY IF EXISTS "Users can update their own storybooks" ON public.storybooks;
DROP POLICY IF EXISTS "Users can delete their own storybooks" ON public.storybooks;

DROP POLICY IF EXISTS "Users can view their own colorings" ON public.colorings;
DROP POLICY IF EXISTS "Users can insert their own colorings" ON public.colorings;
DROP POLICY IF EXISTS "Users can update their own colorings" ON public.colorings;
DROP POLICY IF EXISTS "Users can delete their own colorings" ON public.colorings;

-- Recreate policies for storybooks
CREATE POLICY "Users can view their own storybooks"
    ON public.storybooks FOR SELECT
    USING (
        user_id_fk IS NULL OR
        auth.uid() = user_id_fk
    );

CREATE POLICY "Users can insert their own storybooks"
    ON public.storybooks FOR INSERT
    WITH CHECK (
        user_id_fk IS NULL OR
        auth.uid() = user_id_fk
    );

CREATE POLICY "Users can update their own storybooks"
    ON public.storybooks FOR UPDATE
    USING (
        user_id_fk IS NULL OR
        auth.uid() = user_id_fk
    );

CREATE POLICY "Users can delete their own storybooks"
    ON public.storybooks FOR DELETE
    USING (
        user_id_fk IS NULL OR
        auth.uid() = user_id_fk
    );

-- Recreate policies for colorings
CREATE POLICY "Users can view their own colorings"
    ON public.colorings FOR SELECT
    USING (
        user_id_fk IS NULL OR
        auth.uid() = user_id_fk
    );

CREATE POLICY "Users can insert their own colorings"
    ON public.colorings FOR INSERT
    WITH CHECK (
        user_id_fk IS NULL OR
        auth.uid() = user_id_fk
    );

CREATE POLICY "Users can update their own colorings"
    ON public.colorings FOR UPDATE
    USING (
        user_id_fk IS NULL OR
        auth.uid() = user_id_fk
    );

CREATE POLICY "Users can delete their own colorings"
    ON public.colorings FOR DELETE
    USING (
        user_id_fk IS NULL OR
        auth.uid() = user_id_fk
    );

-- =====================================================
-- STEP 5: ENSURE INDEXES EXIST
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_storybooks_user_id ON public.storybooks(user_id_fk);
CREATE INDEX IF NOT EXISTS idx_storybooks_created_at ON public.storybooks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_colorings_user_id ON public.colorings(user_id_fk);
CREATE INDEX IF NOT EXISTS idx_colorings_created_at ON public.colorings(created_at DESC);

-- =====================================================
-- STEP 6: ENSURE TRIGGERS EXIST
-- =====================================================
DO $$
BEGIN
    -- Create function if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column'
    ) THEN
        CREATE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $func$
        BEGIN
            NEW.updated_at = TIMEZONE('utc', NOW());
            RETURN NEW;
        END;
        $func$ LANGUAGE plpgsql;
    END IF;
END$$;

-- Drop and recreate triggers
DROP TRIGGER IF EXISTS update_storybooks_updated_at ON public.storybooks;
DROP TRIGGER IF EXISTS update_colorings_updated_at ON public.colorings;

CREATE TRIGGER update_storybooks_updated_at
    BEFORE UPDATE ON public.storybooks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_colorings_updated_at
    BEFORE UPDATE ON public.colorings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VERIFICATION
-- =====================================================
DO $$
DECLARE
    storybooks_pk_count INTEGER;
BEGIN
    -- Check that storybooks has only id as primary key
    SELECT COUNT(*) INTO storybooks_pk_count
    FROM information_schema.key_column_usage
    WHERE table_schema = 'public'
    AND table_name = 'storybooks'
    AND constraint_name = 'storybooks_pkey';

    IF storybooks_pk_count = 1 THEN
        RAISE NOTICE '✅ Migration completed successfully!';
        RAISE NOTICE '✅ Storybooks primary key: FIXED (only id)';
        RAISE NOTICE '✅ Colorings table: READY';
    ELSE
        RAISE WARNING '⚠ Primary key might still have issues. Count: %', storybooks_pk_count;
    END IF;
END$$;
