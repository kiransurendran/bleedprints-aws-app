npx supabase login
npx supabase link --project-ref pejeiepvbwxzvbkzrktm
or
npx supabase init
npx supabase link --project-ref pejeiepvbwxzvbkzrktm

npx supabase secrets set RAZORPAY_KEY_ID=rzp_test_or_live_xxxxx
npx supabase secrets set RAZORPAY_KEY_SECRET=your_razorpay_secret

npx supabase functions deploy create-razorpay-order
npx supabase functions deploy verify-razorpay-payment
