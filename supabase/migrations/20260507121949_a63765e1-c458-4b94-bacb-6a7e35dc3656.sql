
-- Extend profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS profile_image_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS business_name text DEFAULT '',
  ADD COLUMN IF NOT EXISTS district text DEFAULT '',
  ADD COLUMN IF NOT EXISTS state text DEFAULT '',
  ADD COLUMN IF NOT EXISTS farming_type text DEFAULT '';

-- Extend crop_listings with image array
ALTER TABLE public.crop_listings
  ADD COLUMN IF NOT EXISTS image_urls text[] NOT NULL DEFAULT '{}';

-- Buyer requests table
CREATE TABLE IF NOT EXISTS public.buyer_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL,
  crop_name text NOT NULL,
  quantity_needed text NOT NULL,
  offer_price text NOT NULL,
  location text NOT NULL DEFAULT '',
  notes text DEFAULT '',
  image_urls text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.buyer_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view buyer requests"
  ON public.buyer_requests FOR SELECT TO authenticated USING (true);

CREATE POLICY "Buyers can insert own requests"
  ON public.buyer_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Buyers can update own requests"
  ON public.buyer_requests FOR UPDATE TO authenticated
  USING (auth.uid() = buyer_id);

CREATE POLICY "Buyers can delete own requests"
  ON public.buyer_requests FOR DELETE TO authenticated
  USING (auth.uid() = buyer_id);

-- updated_at trigger function (shared)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS trg_buyer_requests_updated_at ON public.buyer_requests;
CREATE TRIGGER trg_buyer_requests_updated_at
  BEFORE UPDATE ON public.buyer_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_listings_updated_at ON public.crop_listings;
CREATE TRIGGER trg_listings_updated_at
  BEFORE UPDATE ON public.crop_listings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Ensure auth user creation also captures role/phone
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, phone, location, district, state, business_name, farming_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'farmer'),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'location', ''),
    COALESCE(NEW.raw_user_meta_data->>'district', ''),
    COALESCE(NEW.raw_user_meta_data->>'state', ''),
    COALESCE(NEW.raw_user_meta_data->>'business_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'farming_type', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-images', 'profile-images', true)
  ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('crop-images', 'crop-images', true)
  ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('request-images', 'request-images', true)
  ON CONFLICT (id) DO NOTHING;

-- Storage policies: public read, owner-folder write
DO $$
DECLARE b text;
BEGIN
  FOREACH b IN ARRAY ARRAY['profile-images','crop-images','request-images'] LOOP
    EXECUTE format($f$
      DROP POLICY IF EXISTS "Public read %1$s" ON storage.objects;
      CREATE POLICY "Public read %1$s" ON storage.objects FOR SELECT
        USING (bucket_id = %2$L);
      DROP POLICY IF EXISTS "Owner upload %1$s" ON storage.objects;
      CREATE POLICY "Owner upload %1$s" ON storage.objects FOR INSERT TO authenticated
        WITH CHECK (bucket_id = %2$L AND auth.uid()::text = (storage.foldername(name))[1]);
      DROP POLICY IF EXISTS "Owner update %1$s" ON storage.objects;
      CREATE POLICY "Owner update %1$s" ON storage.objects FOR UPDATE TO authenticated
        USING (bucket_id = %2$L AND auth.uid()::text = (storage.foldername(name))[1]);
      DROP POLICY IF EXISTS "Owner delete %1$s" ON storage.objects;
      CREATE POLICY "Owner delete %1$s" ON storage.objects FOR DELETE TO authenticated
        USING (bucket_id = %2$L AND auth.uid()::text = (storage.foldername(name))[1]);
    $f$, b, b);
  END LOOP;
END $$;
