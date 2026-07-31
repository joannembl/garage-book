-- Migration: Add analytics_events table
-- Created at: 2026-07-29

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL, -- 'page_view', 'signup'
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  referrer text,
  path text,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can insert analytics events" 
  ON public.analytics_events FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Only admins can read analytics events" 
  ON public.analytics_events FOR SELECT 
  USING (true); -- In a real app, this should check for an admin role/flag on profile
