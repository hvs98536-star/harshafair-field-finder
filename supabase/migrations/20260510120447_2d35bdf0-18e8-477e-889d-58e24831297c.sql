
-- Profiles: allow public viewing
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Profiles are publicly viewable"
  ON public.profiles FOR SELECT
  TO anon, authenticated
  USING (true);

-- Crop listings: allow public viewing
DROP POLICY IF EXISTS "Anyone can view active listings" ON public.crop_listings;
CREATE POLICY "Crop listings are publicly viewable"
  ON public.crop_listings FOR SELECT
  TO anon, authenticated
  USING (true);

-- Buyer requests: allow public viewing
DROP POLICY IF EXISTS "Anyone authenticated can view buyer requests" ON public.buyer_requests;
CREATE POLICY "Buyer requests are publicly viewable"
  ON public.buyer_requests FOR SELECT
  TO anon, authenticated
  USING (true);
