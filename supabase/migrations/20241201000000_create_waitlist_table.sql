-- Create waitlist table
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow anyone to insert (for signups)
CREATE POLICY "Allow public waitlist signups" ON public.waitlist
  FOR INSERT WITH CHECK (true);

-- Only allow authenticated users to view (for admin purposes)
CREATE POLICY "Allow authenticated users to view waitlist" ON public.waitlist
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist(email);
