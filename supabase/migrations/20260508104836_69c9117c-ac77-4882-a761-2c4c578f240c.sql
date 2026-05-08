
-- Add new columns to crop_listings
ALTER TABLE public.crop_listings
  ADD COLUMN IF NOT EXISTS is_organic boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS price_numeric numeric,
  ADD COLUMN IF NOT EXISTS quantity_numeric numeric,
  ADD COLUMN IF NOT EXISTS unit text DEFAULT 'kg';

-- Add to buyer_requests
ALTER TABLE public.buyer_requests
  ADD COLUMN IF NOT EXISTS price_numeric numeric,
  ADD COLUMN IF NOT EXISTS quantity_numeric numeric,
  ADD COLUMN IF NOT EXISTS unit text DEFAULT 'kg';

-- Add to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS bio text DEFAULT '';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_crop_listings_crop_name ON public.crop_listings (lower(crop_name));
CREATE INDEX IF NOT EXISTS idx_crop_listings_created_at ON public.crop_listings (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crop_listings_price_numeric ON public.crop_listings (price_numeric);
CREATE INDEX IF NOT EXISTS idx_buyer_requests_crop_name ON public.buyer_requests (lower(crop_name));
CREATE INDEX IF NOT EXISTS idx_buyer_requests_created_at ON public.buyer_requests (created_at DESC);

-- Favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  item_type text NOT NULL CHECK (item_type IN ('listing','request')),
  item_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_type, item_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
  ON public.favorites FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON public.favorites FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON public.favorites FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites (user_id, item_type);
