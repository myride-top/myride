-- Wave 1: Performance indexes + RPC analytics aggregation

-- Composite indexes matching real query patterns
create index if not exists idx_car_views_car_id_created_at_desc
  on public.car_views (car_id, created_at desc);

create index if not exists idx_car_shares_car_id_created_at_desc
  on public.car_shares (car_id, created_at desc);

create index if not exists idx_car_comments_car_id_created_at_desc
  on public.car_comments (car_id, created_at desc);

create index if not exists idx_car_likes_car_id_created_at_desc
  on public.car_likes (car_id, created_at desc);

create index if not exists idx_event_views_event_id_created_at_desc
  on public.event_views (event_id, created_at desc);

create index if not exists idx_event_shares_event_id_created_at_desc
  on public.event_shares (event_id, created_at desc);

create index if not exists idx_event_attendees_event_id_attending_created_at_desc
  on public.event_attendees (event_id, attending, created_at desc);

create index if not exists idx_event_attendees_event_id_attending_true_created_at_desc
  on public.event_attendees (event_id, created_at desc)
  where attending = true;

create index if not exists idx_events_created_by_event_date_desc
  on public.events (created_by, event_date desc);

-- RPC: Aggregated analytics summary
create or replace function public.get_user_analytics_summary(
  p_user_id uuid,
  p_start timestamptz,
  p_end timestamptz
)
returns table (
  views bigint,
  likes bigint,
  shares bigint,
  comments bigint
)
language sql
stable
security definer
set search_path = public
as $$
with user_cars as (
  select id from public.cars where user_id = p_user_id
),
user_events as (
  select id from public.events where created_by = p_user_id
),
car_views_count as (
  select count(*)::bigint as value
  from public.car_views cv
  join user_cars uc on uc.id = cv.car_id
  where cv.created_at >= p_start and cv.created_at <= p_end
),
event_views_count as (
  select count(*)::bigint as value
  from public.event_views ev
  join user_events ue on ue.id = ev.event_id
  where ev.created_at >= p_start and ev.created_at <= p_end
),
car_likes_count as (
  select count(*)::bigint as value
  from public.car_likes cl
  join user_cars uc on uc.id = cl.car_id
  where cl.created_at >= p_start and cl.created_at <= p_end
),
car_shares_count as (
  select count(*)::bigint as value
  from public.car_shares cs
  join user_cars uc on uc.id = cs.car_id
  where cs.created_at >= p_start and cs.created_at <= p_end
),
event_shares_count as (
  select count(*)::bigint as value
  from public.event_shares es
  join user_events ue on ue.id = es.event_id
  where es.created_at >= p_start and es.created_at <= p_end
),
car_comments_count as (
  select count(*)::bigint as value
  from public.car_comments cc
  join user_cars uc on uc.id = cc.car_id
  where cc.created_at >= p_start and cc.created_at <= p_end
)
select
  coalesce((select value from car_views_count), 0) +
  coalesce((select value from event_views_count), 0) as views,
  coalesce((select value from car_likes_count), 0) as likes,
  coalesce((select value from car_shares_count), 0) +
  coalesce((select value from event_shares_count), 0) as shares,
  coalesce((select value from car_comments_count), 0) as comments;
$$;

-- RPC: Per-car performance
create or replace function public.get_user_car_performance(
  p_user_id uuid,
  p_start timestamptz,
  p_end timestamptz
)
returns table (
  id uuid,
  name text,
  views bigint,
  likes bigint,
  shares bigint,
  comments bigint,
  engagement numeric,
  image text
)
language sql
stable
security definer
set search_path = public
as $$
with car_view_stats as (
  select car_id, count(*)::bigint as views
  from public.car_views
  where created_at >= p_start and created_at <= p_end
  group by car_id
),
car_like_stats as (
  select car_id, count(*)::bigint as likes
  from public.car_likes
  where created_at >= p_start and created_at <= p_end
  group by car_id
),
car_share_stats as (
  select car_id, count(*)::bigint as shares
  from public.car_shares
  where created_at >= p_start and created_at <= p_end
  group by car_id
),
car_comment_stats as (
  select car_id, count(*)::bigint as comments
  from public.car_comments
  where created_at >= p_start and created_at <= p_end
  group by car_id
)
select
  c.id,
  c.name,
  coalesce(cvs.views, 0) as views,
  coalesce(cls.likes, 0) as likes,
  coalesce(css.shares, 0) as shares,
  coalesce(ccs.comments, 0) as comments,
  round(
    case
      when coalesce(cvs.views, 0) = 0 then 0
      else ((coalesce(cls.likes, 0) + coalesce(css.shares, 0) + coalesce(ccs.comments, 0))::numeric / coalesce(cvs.views, 0)::numeric) * 100
    end,
    2
  ) as engagement,
  c.main_photo_url as image
from public.cars c
left join car_view_stats cvs on cvs.car_id = c.id
left join car_like_stats cls on cls.car_id = c.id
left join car_share_stats css on css.car_id = c.id
left join car_comment_stats ccs on ccs.car_id = c.id
where c.user_id = p_user_id
order by engagement desc, c.created_at desc;
$$;

-- RPC: Per-event performance
create or replace function public.get_user_event_performance(
  p_user_id uuid,
  p_start timestamptz,
  p_end timestamptz
)
returns table (
  id uuid,
  title text,
  views bigint,
  attendees bigint,
  shares bigint,
  event_date timestamptz,
  description text
)
language sql
stable
security definer
set search_path = public
as $$
with event_view_stats as (
  select event_id, count(*)::bigint as views
  from public.event_views
  where created_at >= p_start and created_at <= p_end
  group by event_id
),
event_attendee_stats as (
  select event_id, count(*)::bigint as attendees
  from public.event_attendees
  where attending = true
    and created_at >= p_start and created_at <= p_end
  group by event_id
),
event_share_stats as (
  select event_id, count(*)::bigint as shares
  from public.event_shares
  where created_at >= p_start and created_at <= p_end
  group by event_id
)
select
  e.id,
  e.title,
  coalesce(evs.views, 0) as views,
  coalesce(eas.attendees, 0) as attendees,
  coalesce(ess.shares, 0) as shares,
  e.event_date,
  e.description
from public.events e
left join event_view_stats evs on evs.event_id = e.id
left join event_attendee_stats eas on eas.event_id = e.id
left join event_share_stats ess on ess.event_id = e.id
where e.created_by = p_user_id
order by attendees desc, e.event_date desc;
$$;

revoke all on function public.get_user_analytics_summary(uuid, timestamptz, timestamptz) from public;
revoke all on function public.get_user_car_performance(uuid, timestamptz, timestamptz) from public;
revoke all on function public.get_user_event_performance(uuid, timestamptz, timestamptz) from public;

grant execute on function public.get_user_analytics_summary(uuid, timestamptz, timestamptz) to authenticated;
grant execute on function public.get_user_car_performance(uuid, timestamptz, timestamptz) to authenticated;
grant execute on function public.get_user_event_performance(uuid, timestamptz, timestamptz) to authenticated;
