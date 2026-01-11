-- Stockbase Waitlist Database Schema
-- Run this in your Supabase SQL Editor

-- Create waitlist table
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source TEXT DEFAULT 'website',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'invited', 'active', 'declined')),
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Indexes for performance
  CONSTRAINT waitlist_email_unique UNIQUE (email)
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist(email);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON public.waitlist(created_at DESC);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON public.waitlist(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role to do everything
CREATE POLICY "Service role has full access" ON public.waitlist
  FOR ALL
  USING (auth.role() = 'service_role');

-- Create policy for public inserts (optional - if you want to allow direct inserts from client)
-- CREATE POLICY "Anyone can insert" ON public.waitlist
--   FOR INSERT
--   WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.waitlist
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Optional: Create analytics view for waitlist stats
CREATE OR REPLACE VIEW public.waitlist_stats AS
SELECT
  COUNT(*) as total_signups,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as signups_24h,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as signups_7d,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as signups_30d,
  COUNT(*) FILTER (WHERE status = 'pending') as pending,
  COUNT(*) FILTER (WHERE status = 'invited') as invited,
  COUNT(*) FILTER (WHERE status = 'active') as active,
  MIN(created_at) as first_signup,
  MAX(created_at) as latest_signup
FROM public.waitlist;

-- Grant access to the view
GRANT SELECT ON public.waitlist_stats TO authenticated, anon, service_role;

-- Insert a test record (optional - remove in production)
-- INSERT INTO public.waitlist (first_name, last_name, email, source)
-- VALUES ('Test', 'User', 'test@example.com', 'manual');

-- Display success message
DO $$
BEGIN
  RAISE NOTICE 'Waitlist schema created successfully!';
  RAISE NOTICE 'You can now use the waitlist table to store signups.';
END $$;
