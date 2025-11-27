-- Migration: Auth Trigger - Sync Supabase Auth with Users Table
-- Description: Automatically creates user profile when Supabase Auth user signs up
-- Created: 2025-11-27

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert new user into users table when auth.users record is created
  INSERT INTO public.users (
    auth_user_id,
    email,
    name,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NULL),
    NOW(),
    NOW()
  );

  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- If user already exists (e.g., from migration), update auth_user_id
    UPDATE public.users
    SET
      auth_user_id = NEW.id,
      updated_at = NOW()
    WHERE email = NEW.email;

    RETURN NEW;
END;
$$;

-- Trigger on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Comment on function
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates or updates user profile when Supabase Auth user is created';
