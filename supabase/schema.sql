-- =============================================
-- WFM TALENT GAME — Supabase Schema
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- =============================================

-- Salas de juego
CREATE TABLE IF NOT EXISTS game_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(6) UNIQUE NOT NULL,
  host_id UUID NOT NULL,
  status VARCHAR(20) DEFAULT 'lobby',  -- lobby|playing|ended
  difficulty INT DEFAULT 2,
  rh_mode VARCHAR(20) DEFAULT 'player', -- player|auto
  round INT DEFAULT 1,
  budget INT DEFAULT 300,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jugadores en sala
CREATE TABLE IF NOT EXISTS game_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE,
  player_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL,
  obra_id VARCHAR(10),  -- o1, o2, o3, null para RH
  color VARCHAR(20),
  vetos_left INT DEFAULT 2,
  is_ready BOOLEAN DEFAULT FALSE,
  is_host BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Estado del juego (obras + slots + talento)
CREATE TABLE IF NOT EXISTS game_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE UNIQUE,
  obras JSONB NOT NULL DEFAULT '[]',
  talent JSONB NOT NULL DEFAULT '[]',
  extra_talent JSONB DEFAULT '[]',
  transfers JSONB DEFAULT '[]',
  frozen_obras JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Propuestas de movimiento (para el flujo de veto)
CREATE TABLE IF NOT EXISTS transfer_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE,
  proposer_id UUID REFERENCES game_players(id),
  proposer_name VARCHAR(100),
  target_player_id UUID REFERENCES game_players(id),
  person_id VARCHAR(10) NOT NULL,
  slot_id VARCHAR(10) NOT NULL,
  from_obra VARCHAR(100),
  to_obra_id VARCHAR(10),
  status VARCHAR(20) DEFAULT 'pending',  -- pending|accepted|vetoed|expired
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Log de eventos y bitácora
CREATE TABLE IF NOT EXISTS game_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'info',  -- info|good|bad|event|warn
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Habilitar Realtime
-- =============================================
ALTER TABLE game_rooms REPLICA IDENTITY FULL;
ALTER TABLE game_players REPLICA IDENTITY FULL;
ALTER TABLE game_state REPLICA IDENTITY FULL;
ALTER TABLE transfer_proposals REPLICA IDENTITY FULL;
ALTER TABLE game_log REPLICA IDENTITY FULL;

-- =============================================
-- Row Level Security (RLS)
-- =============================================
ALTER TABLE game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_log ENABLE ROW LEVEL SECURITY;

-- Políticas abiertas para el juego (anon puede leer/escribir)
-- En producción con usuarios reales, refinar estas políticas

CREATE POLICY "allow_all_game_rooms" ON game_rooms FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_game_players" ON game_players FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_game_state" ON game_state FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_transfer_proposals" ON transfer_proposals FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_game_log" ON game_log FOR ALL TO anon USING (true) WITH CHECK (true);

-- =============================================
-- Publicaciones para Realtime
-- =============================================
-- Ejecutar en Supabase Dashboard > Database > Replication
-- O via SQL:
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

ALTER PUBLICATION supabase_realtime ADD TABLE game_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE game_players;
ALTER PUBLICATION supabase_realtime ADD TABLE game_state;
ALTER PUBLICATION supabase_realtime ADD TABLE transfer_proposals;
ALTER PUBLICATION supabase_realtime ADD TABLE game_log;
