-- FARMA DO BAIRRO — MÓDULO CONTABILIDADE / REGIME INTELIGENTE
-- Rode este arquivo no SQL Editor do Supabase depois do farma-do-bairro_schema.sql

ALTER TABLE produtos ADD COLUMN IF NOT EXISTS ncm TEXT;
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS cest TEXT;
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS cst TEXT;
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS cfop TEXT;
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS fiscal_category TEXT;
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS is_monophase BOOLEAN DEFAULT FALSE;
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS has_icms_st BOOLEAN DEFAULT FALSE;
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS has_anticipation_icms BOOLEAN DEFAULT FALSE;
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS is_service BOOLEAN DEFAULT FALSE;
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS canal_venda TEXT DEFAULT 'app';
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS gateway_pagamento TEXT;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS parcelas INTEGER DEFAULT 1;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS mdr_fee DECIMAL(10,2) DEFAULT 0;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS anticipation_fee DECIMAL(10,2) DEFAULT 0;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS liquidado_em DATE;

CREATE TABLE IF NOT EXISTS contabilidade_parametros (
  id SERIAL PRIMARY KEY,
  farmacia_id INTEGER REFERENCES farmacias(id) ON DELETE CASCADE,
  current_regime TEXT DEFAULT 'simples_nacional',
  payroll DECIMAL(12,2) DEFAULT 0,
  pro_labore DECIMAL(12,2) DEFAULT 0,
  rat_rate DECIMAL(8,4) DEFAULT 0.02,
  terceiros_rate DECIMAL(8,4) DEFAULT 0.058,
  percent_monophase DECIMAL(8,4) DEFAULT 0,
  percent_st DECIMAL(8,4) DEFAULT 0,
  percent_monophase_st DECIMAL(8,4) DEFAULT 0,
  percent_anticipation DECIMAL(8,4) DEFAULT 0,
  percent_services DECIMAL(8,4) DEFAULT 0,
  estimated_icms_non_simples_rate DECIMAL(8,4) DEFAULT 0.028,
  accounting_profit_rate DECIMAL(8,4) DEFAULT 0.085,
  use_live_sales BOOLEAN DEFAULT TRUE,
  data_quality_score DECIMAL(8,4) DEFAULT 0.72,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(farmacia_id)
);

CREATE TABLE IF NOT EXISTS contabilidade_avaliacoes (
  id SERIAL PRIMARY KEY,
  farmacia_id INTEGER REFERENCES farmacias(id) ON DELETE CASCADE,
  periodo_referencia TEXT,
  current_regime TEXT,
  recommended_regime TEXT,
  confidence_score DECIMAL(8,4),
  monthly_revenue DECIMAL(12,2) DEFAULT 0,
  simples_annual_tax DECIMAL(12,2) DEFAULT 0,
  presumido_annual_tax DECIMAL(12,2) DEFAULT 0,
  real_annual_tax DECIMAL(12,2) DEFAULT 0,
  estimated_annual_savings DECIMAL(12,2) DEFAULT 0,
  drivers_json JSONB DEFAULT '[]'::jsonb,
  warnings_json JSONB DEFAULT '[]'::jsonb,
  payload_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE contabilidade_parametros ENABLE ROW LEVEL SECURITY;
ALTER TABLE contabilidade_avaliacoes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'contabilidade_parametros' AND policyname = 'acesso_contab_parametros') THEN
    CREATE POLICY acesso_contab_parametros ON contabilidade_parametros FOR ALL TO anon, authenticated USING (TRUE) WITH CHECK (TRUE);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'contabilidade_avaliacoes' AND policyname = 'acesso_contab_avaliacoes') THEN
    CREATE POLICY acesso_contab_avaliacoes ON contabilidade_avaliacoes FOR ALL TO anon, authenticated USING (TRUE) WITH CHECK (TRUE);
  END IF;
END $$;
