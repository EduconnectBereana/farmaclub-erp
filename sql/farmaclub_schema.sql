-- FarmaClub — schema inicial com cadastro fiscal, entrada por XML e pagamentos MVP

create table if not exists farmacias (
  id bigserial primary key,
  nome text not null,
  cnpj text unique,
  bairro text,
  ativo boolean default true,
  criada_em timestamptz default now()
);

create table if not exists usuarios (
  id bigserial primary key,
  auth_uid uuid unique,
  farmacia_id bigint references farmacias(id),
  nome text not null,
  email text unique,
  perfil text not null check (perfil in ('gestor','farmacia','motoboy','contador','cliente')),
  criado_em timestamptz default now()
);

create table if not exists fornecedores (
  id bigserial primary key,
  farmacia_id bigint references farmacias(id),
  nome text not null,
  cnpj text,
  ie text,
  uf text,
  cidade text,
  ativo boolean default true,
  criado_em timestamptz default now()
);

create table if not exists produtos (
  id bigserial primary key,
  farmacia_id bigint references farmacias(id),
  fornecedor_padrao_id bigint references fornecedores(id),
  ean text,
  nome text not null,
  laboratorio text,
  categoria text,
  ncm text,
  cest text,
  registro_anvisa text,
  cfop_entrada text,
  preco_custo numeric(12,2) default 0,
  preco_venda numeric(12,2) default 0,
  preco_pix numeric(12,2) default 0,
  receita boolean default false,
  eh_medicamento boolean default true,
  monofasico boolean default false,
  icms_st boolean default false,
  beneficio_fiscal text,
  fonte_ncm text,
  origem_cadastro text default 'manual' check (origem_cadastro in ('manual','xml','scanner','planilha','api')),
  status_fiscal text default 'pendente' check (status_fiscal in ('pendente','pre_validado','validado','revisar')),
  ativo boolean default true,
  criado_em timestamptz default now()
);

create table if not exists estoque (
  id bigserial primary key,
  farmacia_id bigint references farmacias(id),
  produto_id bigint references produtos(id),
  quantidade integer default 0,
  quantidade_min integer default 0,
  atualizado_em timestamptz default now()
);

create table if not exists notas_entrada (
  id bigserial primary key,
  farmacia_id bigint references farmacias(id),
  fornecedor_id bigint references fornecedores(id),
  chave_nfe text unique,
  numero text,
  serie text,
  emitida_em timestamptz,
  valor_total numeric(12,2) default 0,
  xml_importado boolean default false,
  status_importacao text default 'pendente' check (status_importacao in ('pendente','processada','revisar','erro')),
  xml_payload jsonb,
  criado_em timestamptz default now()
);

create table if not exists nota_entrada_itens (
  id bigserial primary key,
  nota_entrada_id bigint references notas_entrada(id) on delete cascade,
  produto_id bigint references produtos(id),
  codigo_fornecedor text,
  ean text,
  nome text not null,
  ncm text,
  cest text,
  cfop text,
  quantidade numeric(12,3) default 0,
  valor_unitario numeric(12,4) default 0,
  valor_total numeric(12,2) default 0,
  monofasico boolean default false,
  icms_st boolean default false,
  fonte_classificacao text default 'xml',
  status_revisao text default 'pendente' check (status_revisao in ('pendente','validado','revisar')),
  criado_em timestamptz default now()
);

create table if not exists clientes (
  id bigserial primary key,
  nome text not null,
  telefone text,
  email text,
  criado_em timestamptz default now()
);

create table if not exists motoboys (
  id bigserial primary key,
  nome text not null,
  telefone text,
  placa text,
  wallet_id text,
  recebedor_gateway_id text,
  status_kyc text default 'pendente' check (status_kyc in ('pendente','validado','bloqueado')),
  ativo boolean default true,
  criado_em timestamptz default now()
);

create table if not exists recebedores_financeiros (
  id bigserial primary key,
  farmacia_id bigint references farmacias(id),
  motoboy_id bigint references motoboys(id),
  tipo text not null check (tipo in ('farmacia','motoboy','plataforma')),
  nome text not null,
  documento text,
  gateway text,
  wallet_id text,
  recipient_id text,
  status text default 'pendente' check (status in ('pendente','validado','bloqueado')),
  criado_em timestamptz default now()
);

create table if not exists pedidos (
  id bigserial primary key,
  farmacia_id bigint references farmacias(id),
  cliente_id bigint references clientes(id),
  motoboy_id bigint references motoboys(id),
  subtotal_medicamentos numeric(12,2) default 0,
  subtotal_outros numeric(12,2) default 0,
  frete numeric(12,2) default 0,
  juros_parcelamento numeric(12,2) default 0,
  taxa_gateway numeric(12,2) default 0,
  total_bruto numeric(12,2) default 0,
  farmaclub_fee numeric(12,2) default 0,
  net_farmacia numeric(12,2) default 0,
  forma_pagamento_principal text check (forma_pagamento_principal in ('pix','credito','debito')),
  modelo_pagamento text default 'single_method_mvp',
  status text default 'aguardando',
  criado_em timestamptz default now()
);

create table if not exists pedido_itens (
  id bigserial primary key,
  pedido_id bigint references pedidos(id) on delete cascade,
  produto_id bigint references produtos(id),
  quantidade integer not null,
  preco_unit numeric(12,2) not null,
  eh_medicamento boolean default true
);

create table if not exists pedido_pagamentos (
  id bigserial primary key,
  pedido_id bigint references pedidos(id) on delete cascade,
  metodo text not null check (metodo in ('pix','credito','debito')),
  valor numeric(12,2) not null,
  status text default 'aguardando' check (status in ('aguardando','confirmado','falhou','cancelado')),
  gateway text,
  gateway_reference text,
  ordem integer default 1,
  criado_em timestamptz default now()
);

create table if not exists split_repasses (
  id bigserial primary key,
  pedido_id bigint references pedidos(id) on delete cascade,
  recebedor_id bigint references recebedores_financeiros(id),
  tipo text not null check (tipo in ('farmacia','motoboy','plataforma')),
  valor numeric(12,2) not null,
  status text default 'pendente' check (status in ('pendente','agendado','confirmado','falhou')),
  observacao text,
  criado_em timestamptz default now()
);

create table if not exists entregas (
  id bigserial primary key,
  pedido_id bigint references pedidos(id) on delete cascade,
  farmacia_id bigint references farmacias(id),
  motoboy_id bigint references motoboys(id),
  valor_frete numeric(12,2) default 0,
  status text default 'aguardando_pagamento' check (status in ('aguardando_pagamento','aguardando_coleta','em_rota','entregue','cancelada')),
  criada_em timestamptz default now()
);

create table if not exists auditoria (
  id bigserial primary key,
  entidade text not null,
  entidade_id bigint,
  acao text not null,
  payload jsonb,
  criado_em timestamptz default now()
);

alter table farmacias enable row level security;
alter table usuarios enable row level security;
alter table fornecedores enable row level security;
alter table produtos enable row level security;
alter table estoque enable row level security;
alter table notas_entrada enable row level security;
alter table nota_entrada_itens enable row level security;
alter table clientes enable row level security;
alter table motoboys enable row level security;
alter table recebedores_financeiros enable row level security;
alter table pedidos enable row level security;
alter table pedido_itens enable row level security;
alter table pedido_pagamentos enable row level security;
alter table split_repasses enable row level security;
alter table entregas enable row level security;
alter table auditoria enable row level security;
