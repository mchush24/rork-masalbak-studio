-- Migration: Add support for saving completed colorings
-- Description: Add completed_image_url column to store the finished colored images

-- Add completed_image_url column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'colorings' AND column_name = 'completed_image_url'
    ) THEN
        ALTER TABLE public.colorings
        ADD COLUMN completed_image_url TEXT;

        RAISE NOTICE 'Added completed_image_url column to colorings table';
    ELSE
        RAISE NOTICE 'completed_image_url column already exists';
    END IF;
END$$;

-- Add is_completed flag to track completion status
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'colorings' AND column_name = 'is_completed'
    ) THEN
        ALTER TABLE public.colorings
        ADD COLUMN is_completed BOOLEAN DEFAULT FALSE;

        RAISE NOTICE 'Added is_completed column to colorings table';
    ELSE
        RAISE NOTICE 'is_completed column already exists';
    END IF;
END$$;

-- Create index for faster queries on completed colorings
CREATE INDEX IF NOT EXISTS idx_colorings_is_completed
ON public.colorings(is_completed)
WHERE is_completed = TRUE;

-- Final message
DO $$
BEGIN
    RAISE NOTICE '✅ Migration completed - Colorings table now supports completed images';
END$$;
