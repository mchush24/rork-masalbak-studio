-- Migration: Create or recreate storybooks and colorings tables
-- Description: Tables for storing user-generated stories and coloring pages
-- Version: 2 - Handles existing tables

-- =====================================================
-- DROP EXISTING TABLES (if they exist with wrong schema)
-- =====================================================
-- WARNING: This will delete all existing data!
-- Comment out these lines if you want to preserve data
DROP TABLE IF EXISTS public.colorings CASCADE;
DROP TABLE IF EXISTS public.storybooks CASCADE;

-- =====================================================
-- STORYBOOKS TABLE
-- =====================================================
CREATE TABLE public.storybooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id_fk UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    pages JSONB NOT NULL DEFAULT '[]'::jsonb,
    pdf_url TEXT,
    voice_urls TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes for faster queries
CREATE INDEX idx_storybooks_user_id ON public.storybooks(user_id_fk);
CREATE INDEX idx_storybooks_created_at ON public.storybooks(created_at DESC);

-- Enable RLS
ALTER TABLE public.storybooks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for storybooks
CREATE POLICY "Users can view their own storybooks"
    ON public.storybooks FOR SELECT
    USING (
        user_id_fk IS NULL OR -- Allow null user_id (guest users)
        auth.uid() = user_id_fk
    );

CREATE POLICY "Users can insert their own storybooks"
    ON public.storybooks FOR INSERT
    WITH CHECK (
        user_id_fk IS NULL OR -- Allow null user_id (guest users)
        auth.uid() = user_id_fk
    );

CREATE POLICY "Users can update their own storybooks"
    ON public.storybooks FOR UPDATE
    USING (
        user_id_fk IS NULL OR -- Allow null user_id (guest users)
        auth.uid() = user_id_fk
    );

CREATE POLICY "Users can delete their own storybooks"
    ON public.storybooks FOR DELETE
    USING (
        user_id_fk IS NULL OR -- Allow null user_id (guest users)
        auth.uid() = user_id_fk
    );

-- =====================================================
-- COLORINGS TABLE
-- =====================================================
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

-- Indexes for faster queries
CREATE INDEX idx_colorings_user_id ON public.colorings(user_id_fk);
CREATE INDEX idx_colorings_created_at ON public.colorings(created_at DESC);

-- Enable RLS
ALTER TABLE public.colorings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for colorings
CREATE POLICY "Users can view their own colorings"
    ON public.colorings FOR SELECT
    USING (
        user_id_fk IS NULL OR -- Allow null user_id (guest users)
        auth.uid() = user_id_fk
    );

CREATE POLICY "Users can insert their own colorings"
    ON public.colorings FOR INSERT
    WITH CHECK (
        user_id_fk IS NULL OR -- Allow null user_id (guest users)
        auth.uid() = user_id_fk
    );

CREATE POLICY "Users can update their own colorings"
    ON public.colorings FOR UPDATE
    USING (
        user_id_fk IS NULL OR -- Allow null user_id (guest users)
        auth.uid() = user_id_fk
    );

CREATE POLICY "Users can delete their own colorings"
    ON public.colorings FOR DELETE
    USING (
        user_id_fk IS NULL OR -- Allow null user_id (guest users)
        auth.uid() = user_id_fk
    );

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
-- Check if function already exists, create if not
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc
        WHERE proname = 'update_updated_at_column'
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

CREATE TRIGGER update_storybooks_updated_at
    BEFORE UPDATE ON public.storybooks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_colorings_updated_at
    BEFORE UPDATE ON public.colorings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE public.storybooks IS 'Stores user-generated storybooks with pages, PDFs, and voice narrations';
COMMENT ON TABLE public.colorings IS 'Stores user-generated coloring pages with PDFs';
COMMENT ON COLUMN public.storybooks.pages IS 'JSONB array of story pages, each with text and img_url';
COMMENT ON COLUMN public.storybooks.voice_urls IS 'Array of URLs to audio files for each page';
COMMENT ON COLUMN public.colorings.coloring_image_url IS 'URL to the black & white line art coloring page';
