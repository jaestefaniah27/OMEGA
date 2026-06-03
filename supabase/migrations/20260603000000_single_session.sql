-- Sesión única (estilo Clash of Clans): el último login expulsa al
-- dispositivo anterior. Cada device guarda un session_id local y lo escribe
-- aquí al iniciar sesión; los demás detectan el cambio y cierran sesión.
alter table public.profiles add column if not exists active_session_id uuid;
alter table public.profiles add column if not exists active_session_at timestamptz;

-- Faltaba la policy UPDATE en profiles (solo había SELECT): sin ella el
-- usuario no podía escribir su propio perfil (sesión única, editar usuario…).
do $$ begin
  if not exists (select 1 from pg_policies where tablename='profiles' and cmd='UPDATE') then
    create policy "Users can update their own profile" on public.profiles
      for update using (auth.uid() = id) with check (auth.uid() = id);
  end if;
end $$;
