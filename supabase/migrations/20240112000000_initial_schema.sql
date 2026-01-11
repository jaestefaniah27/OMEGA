-- OMEGA: Initial Schema

-- 1. Users Profile (Extiende Auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  oro INTEGER DEFAULT 0,
  xp_intelecto INTEGER DEFAULT 0,
  xp_vigor INTEGER DEFAULT 0,
  xp_hechiceria INTEGER DEFAULT 0,
  xp_carisma INTEGER DEFAULT 0,
  xp_destreza INTEGER DEFAULT 0,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Grimorios (Proyectos)
CREATE TABLE grimorios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Misiones (Tareas)
CREATE TABLE misiones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  grimorio_id UUID REFERENCES grimorios ON DELETE SET NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  dificultad TEXT CHECK (dificultad IN ('FACIL', 'NORMAL', 'DIFICIL', 'EPICA')),
  rama TEXT CHECK (rama IN ('INTELECTO', 'VIGOR', 'HECHICERIA', 'CARISMA', 'DESTREZA')),
  completada BOOLEAN DEFAULT FALSE,
  oro_recompensa INTEGER DEFAULT 10,
  xp_recompensa INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_at TIMESTAMP WITH TIME ZONE
);

-- 4. Logs de Actividad
CREATE TABLE logs_actividad (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  accion TEXT NOT NULL, -- EJ: 'MISION_COMPLETADA', 'LOGIN', 'LEVEL_UP'
  detalles JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE grimorios ENABLE ROW LEVEL SECURITY;
ALTER TABLE misiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs_actividad ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Solo el dueño puede ver/editar sus datos)
CREATE POLICY "Users can see their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can see their own grimorios" ON grimorios FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can see their own misiones" ON misiones FOR SELECT USING (auth.uid() = user_id);
