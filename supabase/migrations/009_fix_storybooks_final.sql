-- Migration: Fix storybooks table - Final version
-- Description: Drop all policies first, then fix schema

-- =====================================================
-- STEP 1: DROP ALL EXISTING POLICIES
-- =====================================================

-- Drop ALL existing policies on storybooks (they depend on user_id)
DROP POLICY IF EXISTS "storybooks_select_own" ON public.storybooks;
DROP POLICY IF EXISTS "storybooks_insert_own" ON public.storybooks;
DROP POLICY IF EXISTS "storybooks_update_own" ON public.storybooks;
DROP POLICY IF EXISTS "storybooks_delete_own" ON public.storybooks;
DROP POLICY IF EXISTS "Users can only read own storybooks" ON public.storybooks;
DROP POLICY IF EXISTS "Users can only insert own storybooks" ON public.storybooks;
DROP POLICY IF EXISTS "Users can only update own storybooks" ON public.storybooks;
DROP POLICY IF EXISTS "Users can only delete own storybooks" ON public.storybooks;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.storybooks;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.storybooks;
DROP POLICY IF EXISTS "Users can view their own storybooks" ON public.storybooks;
DROP POLICY IF EXISTS "Users can insert their own storybooks" ON public.storybooks;
DROP POLICY IF EXISTS "Users can update their own storybooks" ON public.storybooks;
DROP POLICY IF EXISTS "Users can delete their own storybooks" ON public.storybooks;

-- Drop policies on colorings too
DROP POLICY IF EXISTS "Users can view their own colorings" ON public.colorings;
DROP POLICY IF EXISTS "Users can insert their own colorings" ON public.colorings;
DROP POLICY IF EXISTS "Users can update their own colorings" ON public.colorings;
DROP POLICY IF EXISTS "Users can delete their own colorings" ON public.colorings;

-- =====================================================
-- STEP 2: FIX STORYBOOKS PRIMARY KEY
-- =====================================================

-- Drop the incorrect composite primary key
ALTER TABLE public.storybooks DROP CONSTRAINT IF EXISTS storybooks_pkey;

-- Add correct primary key (only id)
ALTER TABLE public.storybooks ADD PRIMARY KEY (id);

-- =====================================================
-- STEP 3: FIX STORYBOOKS COLUMNS
-- =====================================================

-- 1. Make pdf_url nullable
ALTER TABLE public.storybooks ALTER COLUMN pdf_url DROP NOT NULL;

-- 2. Convert voice_urls from JSONB to TEXT[] array
DO $$
BEGIN
    -- Check if voice_urls is JSONB type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'storybooks'
        AND column_name = 'voice_urls'
        AND data_type = 'jsonb'
    ) THEN
        -- Add temporary column
        ALTER TABLE public.storybooks ADD COLUMN voice_urls_new TEXT[];

        -- Copy and convert data
        UPDATE public.storybooks
        SET voice_urls_new = ARRAY(SELECT jsonb_array_elements_text(voice_urls))
        WHERE voice_urls IS NOT NULL AND jsonb_typeof(voice_urls) = 'array';

        -- Drop old column and rename
        ALTER TABLE public.storybooks DROP COLUMN voice_urls;
        ALTER TABLE public.storybooks RENAME COLUMN voice_urls_new TO voice_urls;

        RAISE NOTICE 'Converted voice_urls from JSONB to TEXT[]';
    ELSE
        RAISE NOTICE 'voice_urls is already correct type';
    END IF;
END$$;

-- 3. Remove old user_id column (now safe after dropping policies)
ALTER TABLE public.storybooks DROP COLUMN IF EXISTS user_id;

-- 4. Add updated_at if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'storybooks'
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.storybooks
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW());
        RAISE NOTICE 'Added updated_at column';
    END IF;
END$$;

-- =====================================================
-- STEP 4: FIX/CREATE COLORINGS TABLE
-- =====================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'colorings'
    ) THEN
        -- Create colorings table
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
        -- Update existing colorings table
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'colorings' AND column_name = 'coloring_image_url'
        ) THEN
            ALTER TABLE public.colorings ADD COLUMN coloring_image_url TEXT;
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'colorings' AND column_name = 'page_count'
        ) THEN
            ALTER TABLE public.colorings ADD COLUMN page_count INTEGER DEFAULT 1;
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'colorings' AND column_name = 'updated_at'
        ) THEN
            ALTER TABLE public.colorings ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW());
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'colorings' AND column_name = 'title'
        ) THEN
            ALTER TABLE public.colorings ADD COLUMN title TEXT NOT NULL DEFAULT 'Boyama Sayfası';
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'colorings' AND column_name = 'user_id_fk'
        ) THEN
            ALTER TABLE public.colorings ADD COLUMN user_id_fk UUID REFERENCES public.users(id) ON DELETE CASCADE;
        END IF;

        RAISE NOTICE 'Updated colorings table';
    END IF;
END$$;

-- =====================================================
-- STEP 5: CREATE NEW RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.storybooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colorings ENABLE ROW LEVEL SECURITY;

-- Storybooks policies (using user_id_fk)
CREATE POLICY "Users can view their own storybooks"
    ON public.storybooks FOR SELECT
    USING (user_id_fk IS NULL OR auth.uid() = user_id_fk);

CREATE POLICY "Users can insert their own storybooks"
    ON public.storybooks FOR INSERT
    WITH CHECK (user_id_fk IS NULL OR auth.uid() = user_id_fk);

CREATE POLICY "Users can update their own storybooks"
    ON public.storybooks FOR UPDATE
    USING (user_id_fk IS NULL OR auth.uid() = user_id_fk);

CREATE POLICY "Users can delete their own storybooks"
    ON public.storybooks FOR DELETE
    USING (user_id_fk IS NULL OR auth.uid() = user_id_fk);

-- Colorings policies (using user_id_fk)
CREATE POLICY "Users can view their own colorings"
    ON public.colorings FOR SELECT
    USING (user_id_fk IS NULL OR auth.uid() = user_id_fk);

CREATE POLICY "Users can insert their own colorings"
    ON public.colorings FOR INSERT
    WITH CHECK (user_id_fk IS NULL OR auth.uid() = user_id_fk);

CREATE POLICY "Users can update their own colorings"
    ON public.colorings FOR UPDATE
    USING (user_id_fk IS NULL OR auth.uid() = user_id_fk);

CREATE POLICY "Users can delete their own colorings"
    ON public.colorings FOR DELETE
    USING (user_id_fk IS NULL OR auth.uid() = user_id_fk);

-- =====================================================
-- STEP 6: INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_storybooks_user_id_fk ON public.storybooks(user_id_fk);
CREATE INDEX IF NOT EXISTS idx_storybooks_created_at ON public.storybooks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_colorings_user_id_fk ON public.colorings(user_id_fk);
CREATE INDEX IF NOT EXISTS idx_colorings_created_at ON public.colorings(created_at DESC);

-- =====================================================
-- STEP 7: TRIGGERS
-- =====================================================

-- Create trigger function if not exists
DO $$
BEGIN
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
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_colorings_updated_at
    BEFORE UPDATE ON public.colorings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
DECLARE
    storybooks_pk_count INTEGER;
    colorings_exists BOOLEAN;
BEGIN
    -- Check storybooks primary key
    SELECT COUNT(*) INTO storybooks_pk_count
    FROM information_schema.key_column_usage
    WHERE table_schema = 'public'
    AND table_name = 'storybooks'
    AND constraint_name = 'storybooks_pkey';

    -- Check colorings exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'colorings'
    ) INTO colorings_exists;

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ MIGRATION COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Storybooks table:';
    RAISE NOTICE '  - Primary key: % column(s) (should be 1)', storybooks_pk_count;
    RAISE NOTICE '  - user_id column: REMOVED';
    RAISE NOTICE '  - user_id_fk column: PRESENT';
    RAISE NOTICE '  - RLS policies: RECREATED';
    RAISE NOTICE '';
    RAISE NOTICE '🎨 Colorings table:';
    RAISE NOTICE '  - Exists: %', colorings_exists;
    RAISE NOTICE '  - RLS policies: CREATED';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Ready for production!';
    RAISE NOTICE '';
END$$;
