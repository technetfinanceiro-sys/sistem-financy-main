-- Perfil: foto do usuario logado
-- Rode este script no SQL Editor do Supabase do projeto.

begin;

-- 1) Colunas no perfil para salvar a URL publica e o caminho do arquivo no Storage.
alter table public.profiles
  add column if not exists avatar_url text,
  add column if not exists avatar_path text;

-- 2) Garante que cada usuario autenticado possa atualizar somente o proprio perfil.
-- Se voce ja tiver uma policy equivalente, este bloco apenas ignora a duplicada.
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Users can update own profile'
  ) then
    create policy "Users can update own profile"
    on public.profiles
    for update
    to authenticated
    using (auth.uid() = id)
    with check (auth.uid() = id);
  end if;
end $$;

-- 3) Bucket publico para as fotos de perfil.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-photos',
  'profile-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 4) Policies do Storage:
-- Arquivos ficam em profile-photos/{auth.uid()}/avatar.ext.

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Public can view profile photos'
  ) then
    create policy "Public can view profile photos"
    on storage.objects
    for select
    to public
    using (bucket_id = 'profile-photos');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Users can upload own profile photo'
  ) then
    create policy "Users can upload own profile photo"
    on storage.objects
    for insert
    to authenticated
    with check (
      bucket_id = 'profile-photos'
      and (storage.foldername(name))[1] = auth.uid()::text
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Users can update own profile photo'
  ) then
    create policy "Users can update own profile photo"
    on storage.objects
    for update
    to authenticated
    using (
      bucket_id = 'profile-photos'
      and (storage.foldername(name))[1] = auth.uid()::text
    )
    with check (
      bucket_id = 'profile-photos'
      and (storage.foldername(name))[1] = auth.uid()::text
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Users can delete own profile photo'
  ) then
    create policy "Users can delete own profile photo"
    on storage.objects
    for delete
    to authenticated
    using (
      bucket_id = 'profile-photos'
      and (storage.foldername(name))[1] = auth.uid()::text
    );
  end if;
end $$;

commit;
