-- create the public.members table to mirror auth users
create table public.members (
  id uuid not null references auth.users on delete cascade,
  name text,
  handle text,

  primary key (id)
);

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
