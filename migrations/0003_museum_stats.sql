-- Irreversible museum counters (single row, only increments)
create table if not exists museum_stats (
  id            int primary key default 1 check (id = 1),
  visits        bigint not null default 0,
  interactions  bigint not null default 0,
  indent_ops    bigint not null default 0,
  ai_ops        bigint not null default 0,
  dep_ops       bigint not null default 0,
  tool_ops      bigint not null default 0,
  share_ops     bigint not null default 0,
  joy_ops       bigint not null default 0,
  posts         bigint not null default 0,
  updated_at    timestamptz not null default now()
);

insert into museum_stats (id) values (1)
on conflict (id) do nothing;

create table if not exists museum_events (
  id         serial primary key,
  event_type text not null,
  created_at timestamptz not null default now()
);

create index if not exists museum_events_created_at_idx
  on museum_events (created_at desc);
