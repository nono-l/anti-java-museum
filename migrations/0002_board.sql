-- Bulletin board posts for Python 受苦博物館
create table if not exists board_posts (
  id          serial primary key,
  user_id     text not null,
  author_name text not null,
  body        text not null,
  created_at  timestamptz not null default now()
);

create index if not exists board_posts_created_at_idx on board_posts (created_at desc);
create index if not exists board_posts_user_id_idx on board_posts (user_id);
