-- Fix RLS policies to be PERMISSIVE instead of RESTRICTIVE

-- Drop and recreate user_roles policies as PERMISSIVE
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles"
ON public.user_roles
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
AS PERMISSIVE
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Fix user_profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.user_profiles;

CREATE POLICY "Users can view their own profile"
ON public.user_profiles
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.user_profiles
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.user_profiles
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all profiles"
ON public.user_profiles
AS PERMISSIVE
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Fix trades policies
DROP POLICY IF EXISTS "Users can view their own trades" ON public.trades;
DROP POLICY IF EXISTS "Admins can view all trades" ON public.trades;
DROP POLICY IF EXISTS "Admins can manage all trades" ON public.trades;

CREATE POLICY "Users can view their own trades"
ON public.trades
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all trades"
ON public.trades
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all trades"
ON public.trades
AS PERMISSIVE
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Fix fund_requests policies
DROP POLICY IF EXISTS "Users can view their own fund requests" ON public.fund_requests;
DROP POLICY IF EXISTS "Users can create their own fund requests" ON public.fund_requests;
DROP POLICY IF EXISTS "Admins can view all fund requests" ON public.fund_requests;
DROP POLICY IF EXISTS "Admins can manage all fund requests" ON public.fund_requests;

CREATE POLICY "Users can view their own fund requests"
ON public.fund_requests
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own fund requests"
ON public.fund_requests
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all fund requests"
ON public.fund_requests
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all fund requests"
ON public.fund_requests
AS PERMISSIVE
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));