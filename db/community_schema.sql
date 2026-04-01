-- profiles table
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text,
  email text,
  bio text,
  avatar_url text,
  cover_url text,
  role text default 'member',
  website text,
  location text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles add column if not exists cover_url text;
alter table profiles add column if not exists website text;
alter table profiles add column if not exists location text;

-- community_posts table
create table if not exists community_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references profiles(id) on delete cascade,
  title text,
  content text,
  is_published boolean default true,
  created_at timestamptz default now()
);

-- k_posts table
create table if not exists k_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references profiles(id) on delete cascade,
  content text not null,
  media_url text,
  reply_to_post_id uuid null references k_posts(id) on delete set null,
  repost_of_post_id uuid null references k_posts(id) on delete set null,
  like_count int default 0,
  reply_count int default 0,
  repost_count int default 0,
  is_published boolean default true,
  created_at timestamptz default now()
);

-- follows table
create table if not exists follows (
  follower_id uuid references profiles(id) on delete cascade,
  following_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, following_id)
);

-- contact_messages table
create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  message text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table profiles enable row level security;
alter table community_posts enable row level security;
alter table k_posts enable row level security;
alter table follows enable row level security;
alter table contact_messages enable row level security;

-- RLS policies for profiles
drop policy if exists "Profiles are viewable by everyone" on profiles;
drop policy if exists "Users can update their own profile" on profiles;
create policy "Profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can update their own profile" on profiles for update using (auth.uid() = id);

-- RLS policies for community_posts
drop policy if exists "Anyone can read posts" on community_posts;
drop policy if exists "Users can insert posts" on community_posts;
create policy "Anyone can read posts" on community_posts for select using (true);
create policy "Users can insert posts" on community_posts for insert with check (auth.uid() = author_id);

-- RLS policies for k_posts
drop policy if exists "Public can read published k posts" on k_posts;
drop policy if exists "Users can insert their k posts" on k_posts;
drop policy if exists "Users can update own k posts" on k_posts;
drop policy if exists "Users can delete own k posts" on k_posts;
create policy "Public can read published k posts" on k_posts for select using (is_published = true);
create policy "Users can insert their k posts" on k_posts for insert with check (auth.uid() = author_id);
create policy "Users can update own k posts" on k_posts for update using (auth.uid() = author_id);
create policy "Users can delete own k posts" on k_posts for delete using (auth.uid() = author_id);

-- RLS policies for follows
drop policy if exists "Anyone can read follows" on follows;
drop policy if exists "Users can follow" on follows;
drop policy if exists "Users can unfollow" on follows;
create policy "Anyone can read follows" on follows for select using (true);
create policy "Users can follow" on follows for insert with check (auth.uid() = follower_id);
create policy "Users can unfollow" on follows for delete using (auth.uid() = follower_id);

-- RLS policies for contact_messages
drop policy if exists "Only service role can insert contact messages" on contact_messages;
create policy "Only service role can insert contact messages" on contact_messages for insert with check (auth.role() = 'service_role');

-- Keep updated_at fresh on profile updates
create or replace function public.set_profiles_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_profiles_updated_at_trigger on profiles;
create trigger set_profiles_updated_at_trigger
  before update on profiles
  for each row execute procedure public.set_profiles_updated_at();

-- Trigger to create profile after signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Storage bucket for avatars
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;
