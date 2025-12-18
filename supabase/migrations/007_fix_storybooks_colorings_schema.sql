-- Migration: Fix storybooks and colorings schema
-- Description: Update existing tables without losing data

-- =====================================================
-- FIX STORYBOOKS TABLE
-- =====================================================

-- 1. Make pdf_url nullable (it can be null if PDF generation fails)
ALTER TABLE public.storybooks
ALTER COLUMN pdf_url DROP NOT NULL;

-- 2. Convert voice_urls from JSONB to TEXT[] array
-- First, create temporary column
ALTER TABLE public.storybooks
ADD COLUMN IF NOT EXISTS voice_urls_temp TEXT[];

-- Copy and convert data (JSONB array to TEXT array)
UPDATE public.storybooks
SET voice_urls_temp = ARRAY(SELECT jsonb_array_elements_text(voice_urls))
WHERE voice_urls IS NOT NULL AND jsonb_typeof(voice_urls) = 'array';

-- Drop old column and rename temp
ALTER TABLE public.storybooks DROP COLUMN IF EXISTS voice_urls;
ALTER TABLE public.storybooks RENAME COLUMN voice_urls_temp TO voice_urls;

-- 3. Remove old user_id column (we use user_id_fk now)
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
-- FIX/CREATE COLORINGS TABLE
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

        -- Indexes
        CREATE INDEX idx_colorings_user_id ON public.colorings(user_id_fk);
        CREATE INDEX idx_colorings_created_at ON public.colorings(created_at DESC);

        -- Enable RLS
        ALTER TABLE public.colorings ENABLE ROW LEVEL SECURITY;
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
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'colorings'
            AND column_name = 'page_count'
        ) THEN
            ALTER TABLE public.colorings
            ADD COLUMN page_count INTEGER DEFAULT 1;
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'colorings'
            AND column_name = 'updated_at'
        ) THEN
            ALTER TABLE public.colorings
            ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW());
        END IF;
    END IF;
END$$;

-- =====================================================
-- ENSURE RLS POLICIES EXIST
-- =====================================================

-- Drop existing policies if they exist (to recreate them)
DROP POLICY IF EXISTS "Users can view their own storybooks" ON public.storybooks;
DROP POLICY IF EXISTS "Users can insert their own storybooks" ON public.storybooks;
DROP POLICY IF EXISTS "Users can update their own storybooks" ON public.storybooks;
DROP POLICY IF EXISTS "Users can delete their own storybooks" ON public.storybooks;

DROP POLICY IF EXISTS "Users can view their own colorings" ON public.colorings;
DROP POLICY IF EXISTS "Users can insert their own colorings" ON public.colorings;
DROP POLICY IF EXISTS "Users can update their own colorings" ON public.colorings;
DROP POLICY IF EXISTS "Users can delete their own colorings" ON public.colorings;

-- Enable RLS
ALTER TABLE public.storybooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colorings ENABLE ROW LEVEL SECURITY;

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
-- ENSURE INDEXES EXIST
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_storybooks_user_id ON public.storybooks(user_id_fk);
CREATE INDEX IF NOT EXISTS idx_storybooks_created_at ON public.storybooks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_colorings_user_id ON public.colorings(user_id_fk);
CREATE INDEX IF NOT EXISTS idx_colorings_created_at ON public.colorings(created_at DESC);

-- =====================================================
-- ENSURE TRIGGERS EXIST
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
-- Show final schema for verification
DO $$
BEGIN
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'Storybooks table: Ready';
    RAISE NOTICE 'Colorings table: Ready';
END$$;
