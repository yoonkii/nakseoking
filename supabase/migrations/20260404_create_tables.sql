-- 낙서왕 (Doodle King) database schema

-- Game rooms
create table if not exists game_rooms (
  id uuid primary key default gen_random_uuid(),
  code char(4) unique not null,
  host_id uuid,
  status text not null default 'lobby' check (status in ('lobby', 'playing', 'finished')),
  settings jsonb default '{"rounds": 5}'::jsonb,
  created_at timestamptz default now()
);

-- Players
create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references game_rooms(id) on delete cascade,
  nickname text not null,
  avatar text not null,
  status text not null default 'alive' check (status in ('alive', 'out', 'spectating')),
  is_host boolean default false,
  joined_at timestamptz default now()
);

-- Rounds
create table if not exists rounds (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references game_rooms(id) on delete cascade,
  round_number int not null,
  keyword text not null,
  teacher_type text default 'default',
  timeline jsonb,
  started_at timestamptz,
  ended_at timestamptz
);

-- Submissions
create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  round_id uuid references rounds(id) on delete cascade,
  player_id uuid references players(id) on delete cascade,
  image_url text,
  gemini_score float,
  gemini_comment text,
  submitted_at timestamptz default now(),
  caught boolean default false
);

-- Enable Realtime for game_rooms and players
alter publication supabase_realtime add table game_rooms;
alter publication supabase_realtime add table players;
alter publication supabase_realtime add table rounds;

-- RLS policies (allow everything for anon for MVP)
alter table game_rooms enable row level security;
alter table players enable row level security;
alter table rounds enable row level security;
alter table submissions enable row level security;

create policy "Anyone can read rooms" on game_rooms for select using (true);
create policy "Anyone can create rooms" on game_rooms for insert with check (true);
create policy "Anyone can update rooms" on game_rooms for update using (true);

create policy "Anyone can read players" on players for select using (true);
create policy "Anyone can join" on players for insert with check (true);
create policy "Anyone can update players" on players for update using (true);

create policy "Anyone can read rounds" on rounds for select using (true);
create policy "Anyone can create rounds" on rounds for insert with check (true);
create policy "Anyone can update rounds" on rounds for update using (true);

create policy "Anyone can read submissions" on submissions for select using (true);
create policy "Anyone can submit" on submissions for insert with check (true);

-- Auto-cleanup: delete rooms older than 1 hour
-- (In production, use pg_cron for this)

-- Index for fast room code lookup
create index if not exists idx_game_rooms_code on game_rooms(code);
create index if not exists idx_players_room_id on players(room_id);
create index if not exists idx_rounds_room_id on rounds(room_id);
