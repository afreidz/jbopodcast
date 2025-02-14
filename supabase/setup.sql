set timezone to "UTC";

-- inserts a row into public.members
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.members (id, name, handle)
  values (new.id, new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'handle');
  return new;
end;
$$;

-- trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- make members table to mirror auth users
alter table public.members
drop constraint if exists fk_members_id; -- Drop the existing foreign key constraint if it exists
alter table members
add constraint fk_members_id
foreign key (id)
references auth.users (id)
on delete cascade;

-- RLS
alter table calls enable row level security;

create policy "Allow users to access calls the host"
on public.calls
for select using (auth.uid() = "hostId");

create policy "Allow users to access calls they are a guest on"
on public.calls
for select using (
    exists (
        select 1 from "_GuestRelation" gr
        where "A" = calls.id  -- Ensure the call matches
        and "B" = auth.uid()  -- Ensure the user is a guest
    )
);

create policy "Only allow inserts to calls where the user is the host"
on calls
for insert with check (auth.uid() = "hostId");
