-- Per-user collapse sim progress (login-bound)
create table if not exists sim_saves (
  user_id    text primary key,
  payload    jsonb not null,
  updated_at timestamptz not null default now()
);

create index if not exists sim_saves_updated_at_idx on sim_saves (updated_at desc);
