-- TABLA 1: DEFINICIONES (Los Protocolos)
CREATE TABLE IF NOT EXISTS daily_rituals (
  id bigint primary key generated always as identity,
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  icon text default 'scroll', 
  
  -- Configuración de Frecuencia
  schedule_type text default 'daily', -- 'daily', 'specific_days', 'weekly_quota'
  active_days int[] default '{0,1,2,3,4,5,6}', -- Para 'specific_days' (0=Domingo)
  weekly_target int default 7, -- Para 'weekly_quota' (ej: 3 veces/sem)
  
  -- Vinculación con Actividad
  activity_type text, -- 'GENERAL', 'THEATRE', 'LIBRARY', 'BARRACKS'
  activity_tag text,  -- ID de asignatura, nombre de actividad, etc.
  target_value int default 1,
  unit text default 'SESSIONS', -- 'MINUTES', 'PAGES', 'SESSIONS'

  -- Estado de Racha
  current_streak int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- RLS for daily_rituals
ALTER TABLE daily_rituals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own rituals" ON daily_rituals 
FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- TABLA 2: LOGS DIARIOS (Instancias de hoy)
CREATE TABLE IF NOT EXISTS ritual_logs (
  id bigint primary key generated always as identity,
  ritual_id bigint references daily_rituals on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  date date default current_date,
  
  -- Progreso
  current_value int default 0,      
  target_value int default 1,       
  completed boolean default false,
  
  unique(ritual_id, date)
);

-- RLS for ritual_logs
ALTER TABLE ritual_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own ritual logs" ON ritual_logs 
FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_daily_rituals_user ON daily_rituals(user_id);
CREATE INDEX IF NOT EXISTS idx_ritual_logs_user_date ON ritual_logs(user_id, date);

-- RPC to increment streak
CREATE OR REPLACE FUNCTION increment_ritual_streak(r_id bigint)
RETURNS void AS $$
BEGIN
  UPDATE daily_rituals 
  SET current_streak = current_streak + 1
  WHERE id = r_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
