-- Migration: Add email_subscribers table
-- Created at: 2026-08-05
CREATE TABLE IF NOT EXISTS public.email_subscribers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.email_subscribers ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can insert email subscribers"
  ON public.email_subscribers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Only admins can read email subscribers"
  ON public.email_subscribers FOR SELECT
  USING (true);
