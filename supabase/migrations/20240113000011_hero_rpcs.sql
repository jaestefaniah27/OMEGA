-- Función Atómica para Oro
create or replace function add_gold(amount int)
returns int
language plpgsql
security definer
as $$
declare
  new_val int;
begin
  update profiles
  set gold = gold + amount,
      updated_at = now()
  where id = auth.uid()
  returning gold into new_val;
  
  return new_val;
end;
$$;

-- Función Atómica para XP
create or replace function add_xp(amount int)
returns json
language plpgsql
security definer
as $$
declare
  p_row profiles%rowtype;
begin
  update profiles
  set current_xp = current_xp + amount,
      total_study_minutes = total_study_minutes + amount, -- Asumiendo 1 XP = 1 Minuto de estudio por defecto (puede ajustarse)
      updated_at = now()
  where id = auth.uid()
  returning * into p_row;
  
  return row_to_json(p_row);
end;
$$;
