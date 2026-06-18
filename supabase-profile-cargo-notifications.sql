-- Perfil: cargo editavel e notificacoes
-- Rode este script no SQL Editor do Supabase do projeto.

begin;

-- 1) Campos do perfil.
alter table public.profiles
  add column if not exists cargo text,
  add column if not exists notifications_seen_at timestamptz;

comment on column public.profiles.cargo is 'Cargo ou funcao exibida no perfil do usuario.';
comment on column public.profiles.notifications_seen_at is 'Ultima data em que o usuario marcou notificacoes como lidas.';

-- 2) Garante que o usuario autenticado possa atualizar o proprio perfil
-- para salvar nome, cargo, foto e notificacoes lidas.
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

-- 3) Timestamps usados para contar dados novos nas notificacoes.
-- Se a coluna ja existir, o script apenas garante o default para novos registros.
alter table public.lancamentos_pix
  add column if not exists created_at timestamptz;

alter table public.lancamentos_pix
  alter column created_at set default now();

alter table public.dados_financeiro
  add column if not exists created_at timestamptz;

alter table public.dados_financeiro
  alter column created_at set default now();

-- 4) Indices para as contagens do sino ficarem leves.
create index if not exists idx_lancamentos_pix_created_at
  on public.lancamentos_pix (created_at desc);

create index if not exists idx_dados_financeiro_created_at
  on public.dados_financeiro (created_at desc);

create index if not exists idx_profiles_pending_created_at
  on public.profiles (created_at desc)
  where approved = false;

commit;
