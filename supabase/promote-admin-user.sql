-- Promote an existing authenticated user to admin access.
-- Replace the email below with the account you want to grant admin access to.

update public.user_profiles
set
  role = 'admin',
  updated_at = timezone('utc', now())
where email = 'kiransurendran91@gmail.com';

select user_id, email, role, created_at, updated_at
from public.user_profiles
order by updated_at desc;
