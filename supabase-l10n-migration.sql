-- Migration: Add Preferred Language, Currency, and Region to public.profiles
-- Run this script in the Supabase SQL Editor to support internationalization settings

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(5) DEFAULT 'en',
ADD COLUMN IF NOT EXISTS preferred_currency VARCHAR(3) DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS user_region VARCHAR(2) DEFAULT 'US';

COMMENT ON COLUMN public.profiles.preferred_language IS 'User selected locale/language code (e.g. en, es, hi)';
COMMENT ON COLUMN public.profiles.preferred_currency IS 'User selected settlement currency (e.g. USD, INR, EUR, GBP)';
COMMENT ON COLUMN public.profiles.user_region IS 'Detected or selected country/region ISO code (e.g. US, IN, ES)';
