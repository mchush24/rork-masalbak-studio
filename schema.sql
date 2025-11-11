-- MasalBak Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Create storybooks table
CREATE TABLE IF NOT EXISTS public.storybooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NULL,
  title TEXT NOT NULL,
  pages JSONB NOT NULL,
  pdf_url TEXT NULL,
  voice_urls JSONB NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create colorings table
CREATE TABLE IF NOT EXISTS public.colorings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NULL,
  title TEXT NOT NULL,
  pdf_url TEXT NOT NULL,
  page_count INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS storybooks_user_created_idx 
  ON public.storybooks (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS colorings_user_created_idx 
  ON public.colorings (user_id, created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.storybooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colorings ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now - customize based on your auth setup)
CREATE POLICY "Allow public read access on storybooks" 
  ON public.storybooks FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert access on storybooks" 
  ON public.storybooks FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public read access on colorings" 
  ON public.colorings FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert access on colorings" 
  ON public.colorings FOR INSERT 
  WITH CHECK (true);
