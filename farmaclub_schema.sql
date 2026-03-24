-- ══════════════════════════════════════════════════════════
-- FARMACLUB — SCHEMA COMPLETO SUPABASE
-- Execute no SQL Editor do Supabase em uma única vez
-- ══════════════════════════════════════════════════════════

-- 1. FARMÁCIAS PARCEIRAS
CREATE TABLE IF NOT EXISTS farmacias (
  id            SERIAL PRIMARY KEY,
  nome          TEXT NOT NULL,
  razao_social  TEXT,
  cnpj          TEXT UNIQUE,
  crf           TEXT,
  responsavel   TEXT,
  telefone      TEXT,
  endereco      TEXT,
  bairro        TEXT,
  cidade        TEXT DEFAULT 'Itaperuna',
  uf            TEXT DEFAULT 'RJ',
  cep           TEXT DEFAULT '28300-000',
  lat           DECIMAL(10,6),
  lng           DECIMAL(10,6),
  horario       TEXT,
  nota          DECIMAL(2,1) DEFAULT 5.0,
  cor           TEXT DEFAULT '#3BAA35',
  ativo         BOOLEAN DEFAULT TRUE,
  aberto        BOOLEAN DEFAULT TRUE,
  faturamento_mes DECIMAL(12,2) DEFAULT 0,
  comissao_pct  DECIMAL(4,2) DEFAULT 10.00,
  user_id       UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USUÁRIOS (login por farmácia)
CREATE TABLE IF NOT EXISTS usuarios (
  id            SERIAL PRIMARY KEY,
  farmacia_id   INTEGER REFERENCES farmacias(id) ON DELETE CASCADE,
  nome          TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  perfil        TEXT DEFAULT 'farmacia' CHECK (perfil IN ('gestor','farmacia','motoboy','contador')),
  ativo         BOOLEAN DEFAULT TRUE,
  auth_uid      UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PRODUTOS (catálogo por farmácia)
CREATE TABLE IF NOT EXISTS produtos (
  id            SERIAL PRIMARY KEY,
  farmacia_id   INTEGER REFERENCES farmacias(id) ON DELETE CASCADE,
  ean           TEXT,
  nome          TEXT NOT NULL,
  laboratorio   TEXT,
  categoria     TEXT,
  preco_custo   DECIMAL(10,2) DEFAULT 0,
  preco_venda   DECIMAL(10,2) NOT NULL,
  preco_pix     DECIMAL(10,2),
  icone         TEXT DEFAULT '💊',
  receita       BOOLEAN DEFAULT FALSE,
  ativo         BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ESTOQUE
CREATE TABLE IF NOT EXISTS estoque (
  id              SERIAL PRIMARY KEY,
  farmacia_id     INTEGER REFERENCES farmacias(id) ON DELETE CASCADE,
  produto_id      INTEGER REFERENCES produtos(id) ON DELETE CASCADE,
  quantidade      INTEGER DEFAULT 0,
  quantidade_min  INTEGER DEFAULT 5,
  validade        DATE,
  lote            TEXT,
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(farmacia_id, produto_id)
);

-- 5. CLIENTES
CREATE TABLE IF NOT EXISTS clientes (
  id          SERIAL PRIMARY KEY,
  nome        TEXT NOT NULL,
  email       TEXT UNIQUE,
  telefone    TEXT,
  endereco    TEXT,
  bairro      TEXT,
  cidade      TEXT DEFAULT 'Itaperuna',
  auth_uid    UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PEDIDOS
CREATE TABLE IF NOT EXISTS pedidos (
  id                TEXT PRIMARY KEY DEFAULT ('#' || LPAD(FLOOR(RANDOM()*9999)::TEXT, 4, '0')),
  farmacia_id       INTEGER REFERENCES farmacias(id),
  cliente_id        INTEGER REFERENCES clientes(id),
  motoboy_id        INTEGER,
  cliente_nome      TEXT,
  cliente_tel       TEXT,
  cliente_email     TEXT,
  endereco_entrega  TEXT,
  bairro_entrega    TEXT,
  lat_cliente       DECIMAL(10,6),
  lng_cliente       DECIMAL(10,6),
  total_base        DECIMAL(10,2) DEFAULT 0,
  total_final       DECIMAL(10,2) DEFAULT 0,
  frete             DECIMAL(10,2) DEFAULT 0,
  comissao_fc       DECIMAL(10,2) DEFAULT 0,
  forma_pagamento   TEXT DEFAULT 'PIX',
  modo_entrega      TEXT DEFAULT 'entrega' CHECK (modo_entrega IN ('entrega','retirada')),
  status            TEXT DEFAULT 'aguardando' CHECK (status IN ('aguardando','coletando','entregando','entregue','cancelado')),
  confirmado_cliente BOOLEAN DEFAULT FALSE,
  motoboy_lat       DECIMAL(10,6),
  motoboy_lng       DECIMAL(10,6),
  notas             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ITENS DO PEDIDO
CREATE TABLE IF NOT EXISTS pedido_itens (
  id          SERIAL PRIMARY KEY,
  pedido_id   TEXT REFERENCES pedidos(id) ON DELETE CASCADE,
  produto_id  INTEGER REFERENCES produtos(id),
  farmacia_id INTEGER REFERENCES farmacias(id),
  nome        TEXT NOT NULL,
  icone       TEXT DEFAULT '💊',
  preco_unit  DECIMAL(10,2) NOT NULL,
  quantidade  INTEGER DEFAULT 1,
  subtotal    DECIMAL(10,2),
  receita     BOOLEAN DEFAULT FALSE
);

-- 8. MOTOBOYS
CREATE TABLE IF NOT EXISTS motoboys (
  id          SERIAL PRIMARY KEY,
  nome        TEXT NOT NULL,
  telefone    TEXT,
  cnh         TEXT,
  placa       TEXT,
  lat         DECIMAL(10,6),
  lng         DECIMAL(10,6),
  disponivel  BOOLEAN DEFAULT TRUE,
  em_entrega  BOOLEAN DEFAULT FALSE,
  pedido_atual TEXT REFERENCES pedidos(id),
  ganhos_hoje DECIMAL(10,2) DEFAULT 0,
  entregas_hoje INTEGER DEFAULT 0,
  nota        DECIMAL(2,1) DEFAULT 5.0,
  auth_uid    UUID REFERENCES auth.users(id),
  ativo       BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY — cada farmácia vê só os seus dados
-- ══════════════════════════════════════════════════════════

ALTER TABLE farmacias    ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos     ENABLE ROW LEVEL SECURITY;
ALTER TABLE estoque      ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedido_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE motoboys     ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios     ENABLE ROW LEVEL SECURITY;

-- Políticas: GESTOR vê tudo, FARMÁCIA vê só os seus

-- Farmácias: gestor vê todas, farmácia vê só a sua
CREATE POLICY "gestor_all_farmacias" ON farmacias
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM usuarios u WHERE u.auth_uid = auth.uid() AND u.perfil = 'gestor')
    OR user_id = auth.uid()
  );

-- Produtos: farmácia vê só os seus; gestor e anon veem todos (para o app)
CREATE POLICY "leitura_publica_produtos" ON produtos
  FOR SELECT TO anon, authenticated USING (ativo = TRUE);

CREATE POLICY "farmacia_gerencia_produtos" ON produtos
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM usuarios u WHERE u.auth_uid = auth.uid()
      AND (u.perfil = 'gestor' OR (u.perfil = 'farmacia' AND u.farmacia_id = produtos.farmacia_id)))
  );

-- Estoque: mesma lógica
CREATE POLICY "leitura_estoque" ON estoque
  FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY "farmacia_gerencia_estoque" ON estoque
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM usuarios u WHERE u.auth_uid = auth.uid()
      AND (u.perfil = 'gestor' OR (u.perfil = 'farmacia' AND u.farmacia_id = estoque.farmacia_id)))
  );

-- Pedidos: cliente cria, farmácia e gestor gerenciam
CREATE POLICY "cliente_cria_pedido" ON pedidos
  FOR INSERT TO anon, authenticated WITH CHECK (TRUE);

CREATE POLICY "farmacia_vê_seus_pedidos" ON pedidos
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM usuarios u WHERE u.auth_uid = auth.uid()
      AND (u.perfil = 'gestor' OR u.perfil = 'motoboy'
        OR (u.perfil = 'farmacia' AND u.farmacia_id = pedidos.farmacia_id)))
  );

CREATE POLICY "cliente_ve_seu_pedido" ON pedidos
  FOR SELECT TO anon USING (TRUE);

CREATE POLICY "atualizar_pedido" ON pedidos
  FOR UPDATE TO authenticated USING (TRUE);

-- Itens do pedido: leitura livre, inserção por qualquer um
CREATE POLICY "acesso_itens" ON pedido_itens
  FOR ALL TO anon, authenticated USING (TRUE) WITH CHECK (TRUE);

-- Clientes: cada um vê o seu
CREATE POLICY "cliente_acesso" ON clientes
  FOR ALL TO anon, authenticated USING (TRUE) WITH CHECK (TRUE);

-- Motoboys: gestor e motoboy gerenciam
CREATE POLICY "motoboy_acesso" ON motoboys
  FOR ALL TO authenticated USING (TRUE);

CREATE POLICY "leitura_motoboy" ON motoboys
  FOR SELECT TO anon USING (TRUE);

-- Usuários
CREATE POLICY "usuario_acesso" ON usuarios
  FOR ALL TO authenticated
  USING (
    auth_uid = auth.uid()
    OR EXISTS (SELECT 1 FROM usuarios u WHERE u.auth_uid = auth.uid() AND u.perfil = 'gestor')
  );

-- ══════════════════════════════════════════════════════════
-- DADOS INICIAIS — Mury como gestor
-- (substituir o email pelo seu email real)
-- ══════════════════════════════════════════════════════════

-- Após criar sua conta no Supabase Auth, execute:
-- INSERT INTO usuarios (nome, email, perfil, auth_uid)
-- VALUES ('Mury', 'SEU_EMAIL_AQUI', 'gestor', auth.uid());

-- ══════════════════════════════════════════════════════════
-- FUNÇÃO: atualizar updated_at automaticamente
-- ══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_farmacias_updated
  BEFORE UPDATE ON farmacias
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_produtos_updated
  BEFORE UPDATE ON produtos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_pedidos_updated
  BEFORE UPDATE ON pedidos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
