-- Migration: Add trust_tier and freshness columns to rag_documents
-- Run this in Supabase Dashboard SQL Editor (DDL not available via pgREST)

ALTER TABLE IF EXISTS public.rag_documents
  ADD COLUMN IF NOT EXISTS trust_tier TEXT,
  ADD COLUMN IF NOT EXISTS freshness TEXT;

-- Create an RPC function for the index-rag-rest.mjs fallback call
CREATE OR REPLACE FUNCTION public.add_rag_columns()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  ALTER TABLE IF EXISTS public.rag_documents
    ADD COLUMN IF NOT EXISTS trust_tier TEXT,
    ADD COLUMN IF NOT EXISTS freshness TEXT;
END;
$$;
