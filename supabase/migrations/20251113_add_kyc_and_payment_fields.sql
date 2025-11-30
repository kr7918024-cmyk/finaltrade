-- Add missing fields to user_profiles for complete KYC
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS aadhaar VARCHAR(12),
ADD COLUMN IF NOT EXISTS pan VARCHAR(10),
ADD COLUMN IF NOT EXISTS father_name TEXT,
ADD COLUMN IF NOT EXISTS mother_name TEXT,
ADD COLUMN IF NOT EXISTS nominee_name TEXT,
ADD COLUMN IF NOT EXISTS account_holder_name TEXT,
ADD COLUMN IF NOT EXISTS account_number TEXT,
ADD COLUMN IF NOT EXISTS ifsc_code TEXT,
ADD COLUMN IF NOT EXISTS upi_id TEXT,
ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
ADD COLUMN IF NOT EXISTS aadhaar_front_url TEXT,
ADD COLUMN IF NOT EXISTS aadhaar_back_url TEXT,
ADD COLUMN IF NOT EXISTS pan_card_url TEXT,
ADD COLUMN IF NOT EXISTS passport_url TEXT,
ADD COLUMN IF NOT EXISTS bank_passbook_url TEXT;

-- Create admin payment settings table
CREATE TABLE IF NOT EXISTS public.admin_payment_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name TEXT,
  account_holder_name TEXT,
  account_number TEXT,
  ifsc_code TEXT,
  upi_id TEXT,
  qr_code_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on admin_payment_settings
ALTER TABLE public.admin_payment_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_payment_settings
CREATE POLICY "Anyone can view payment settings"
ON public.admin_payment_settings
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can insert payment settings"
ON public.admin_payment_settings
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update payment settings"
ON public.admin_payment_settings
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete payment settings"
ON public.admin_payment_settings
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Insert default payment settings if not exists
INSERT INTO public.admin_payment_settings (bank_name, account_holder_name)
VALUES ('Please configure payment settings', 'Admin')
ON CONFLICT DO NOTHING;

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can create notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create messages table for live chat
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_admin_message BOOLEAN DEFAULT false,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messages
CREATE POLICY "Users can view their own messages"
ON public.messages
FOR SELECT
TO authenticated
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Admins can view all messages"
ON public.messages
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create function to automatically update balance on fund request approval
CREATE OR REPLACE FUNCTION public.update_balance_on_fund_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    IF NEW.request_type = 'deposit' THEN
      UPDATE public.user_profiles
      SET 
        current_balance = COALESCE(current_balance, 0) + NEW.amount,
        total_deposited = COALESCE(total_deposited, 0) + NEW.amount
      WHERE user_id = NEW.user_id;
    ELSIF NEW.request_type = 'withdrawal' THEN
      UPDATE public.user_profiles
      SET 
        current_balance = COALESCE(current_balance, 0) - NEW.amount,
        total_withdrawn = COALESCE(total_withdrawn, 0) + NEW.amount
      WHERE user_id = NEW.user_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for fund request approval
DROP TRIGGER IF EXISTS on_fund_request_status_change ON public.fund_requests;
CREATE TRIGGER on_fund_request_status_change
AFTER UPDATE OF status ON public.fund_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_balance_on_fund_approval();
