-- Wave 2: Trigger-driven counter synchronization for cars table

create or replace function public.update_car_like_count_from_trigger()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    update public.cars
    set like_count = coalesce(like_count, 0) + 1
    where id = new.car_id;
    return new;
  end if;

  if tg_op = 'DELETE' then
    update public.cars
    set like_count = greatest(coalesce(like_count, 0) - 1, 0)
    where id = old.car_id;
    return old;
  end if;

  return null;
end;
$$;

create or replace function public.update_car_view_count_from_trigger()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    update public.cars
    set view_count = coalesce(view_count, 0) + 1
    where id = new.car_id;
    return new;
  end if;

  if tg_op = 'DELETE' then
    update public.cars
    set view_count = greatest(coalesce(view_count, 0) - 1, 0)
    where id = old.car_id;
    return old;
  end if;

  return null;
end;
$$;

create or replace function public.update_car_share_count_from_trigger()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    update public.cars
    set share_count = coalesce(share_count, 0) + 1
    where id = new.car_id;
    return new;
  end if;

  if tg_op = 'DELETE' then
    update public.cars
    set share_count = greatest(coalesce(share_count, 0) - 1, 0)
    where id = old.car_id;
    return old;
  end if;

  return null;
end;
$$;

create or replace function public.update_car_comment_count_from_trigger()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    update public.cars
    set comment_count = coalesce(comment_count, 0) + 1
    where id = new.car_id;
    return new;
  end if;

  if tg_op = 'DELETE' then
    update public.cars
    set comment_count = greatest(coalesce(comment_count, 0) - 1, 0)
    where id = old.car_id;
    return old;
  end if;

  return null;
end;
$$;

drop trigger if exists trg_car_likes_counter on public.car_likes;
create trigger trg_car_likes_counter
after insert or delete on public.car_likes
for each row
execute function public.update_car_like_count_from_trigger();

drop trigger if exists trg_car_views_counter on public.car_views;
create trigger trg_car_views_counter
after insert or delete on public.car_views
for each row
execute function public.update_car_view_count_from_trigger();

drop trigger if exists trg_car_shares_counter on public.car_shares;
create trigger trg_car_shares_counter
after insert or delete on public.car_shares
for each row
execute function public.update_car_share_count_from_trigger();

drop trigger if exists trg_car_comments_counter on public.car_comments;
create trigger trg_car_comments_counter
after insert or delete on public.car_comments
for each row
execute function public.update_car_comment_count_from_trigger();

-- Backfill counts to guarantee consistency before trigger-driven mode
update public.cars c
set like_count = coalesce(v.like_count, 0)
from (
  select car_id, count(*)::integer as like_count
  from public.car_likes
  group by car_id
) v
where c.id = v.car_id;

update public.cars
set like_count = 0
where like_count is null;

update public.cars c
set view_count = coalesce(v.view_count, 0)
from (
  select car_id, count(*)::integer as view_count
  from public.car_views
  group by car_id
) v
where c.id = v.car_id;

update public.cars
set view_count = 0
where view_count is null;

update public.cars c
set share_count = coalesce(v.share_count, 0)
from (
  select car_id, count(*)::integer as share_count
  from public.car_shares
  group by car_id
) v
where c.id = v.car_id;

update public.cars
set share_count = 0
where share_count is null;

update public.cars c
set comment_count = coalesce(v.comment_count, 0)
from (
  select car_id, count(*)::integer as comment_count
  from public.car_comments
  group by car_id
) v
where c.id = v.car_id;

update public.cars
set comment_count = 0
where comment_count is null;
