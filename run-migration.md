# Database Migration Required

To add the enhanced schema (KYC documents, payment settings, notifications, messages), you need to run the migration in your Supabase dashboard:

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to "SQL Editor"
4. Copy the contents of `supabase/migrations/20251113_add_kyc_and_payment_fields.sql`
5. Paste and run the SQL

Alternatively, if you have Supabase CLI installed locally:
```bash
supabase db push
```

This will add:
- KYC document fields (Aadhaar, PAN, etc.)
- Admin payment settings table
- Notifications table
- Messages table for live chat
- Auto-update balance on fund approval trigger
