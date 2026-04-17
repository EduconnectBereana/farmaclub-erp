-- FARMACLUB — RLS HARDENED (base simplificada)

create or replace function meu_perfil()
returns text
language sql
security definer
stable
as $$
  select perfil from usuarios where auth_uid = auth.uid() limit 1;
$$;

create or replace function minha_farmacia_id()
returns bigint
language sql
security definer
stable
as $$
  select farmacia_id from usuarios where auth_uid = auth.uid() limit 1;
$$;

drop policy if exists farm_select_auth on farmacias;
drop policy if exists farm_update_auth on farmacias;
drop policy if exists user_select_auth on usuarios;
drop policy if exists user_update_auth on usuarios;
drop policy if exists prod_select_auth on produtos;
drop policy if exists prod_write_auth on produtos;
drop policy if exists estoque_select_auth on estoque;
drop policy if exists estoque_write_auth on estoque;
drop policy if exists pedido_select_auth on pedidos;
drop policy if exists pedido_write_auth on pedidos;
drop policy if exists moto_select_auth on motoboys;

create policy farm_select_auth on farmacias
for select to authenticated
using (meu_perfil() = 'gestor' or id = minha_farmacia_id());

create policy farm_update_auth on farmacias
for update to authenticated
using (meu_perfil() = 'gestor' or id = minha_farmacia_id())
with check (meu_perfil() = 'gestor' or id = minha_farmacia_id());

create policy user_select_auth on usuarios
for select to authenticated
using (auth_uid = auth.uid() or meu_perfil() = 'gestor');

create policy user_update_auth on usuarios
for update to authenticated
using (auth_uid = auth.uid() or meu_perfil() = 'gestor')
with check (auth_uid = auth.uid() or meu_perfil() = 'gestor');

create policy prod_select_auth on produtos
for select to authenticated
using (meu_perfil() = 'gestor' or farmacia_id = minha_farmacia_id());

create policy prod_write_auth on produtos
for all to authenticated
using (meu_perfil() = 'gestor' or farmacia_id = minha_farmacia_id())
with check (meu_perfil() = 'gestor' or farmacia_id = minha_farmacia_id());

create policy estoque_select_auth on estoque
for select to authenticated
using (meu_perfil() = 'gestor' or farmacia_id = minha_farmacia_id());

create policy estoque_write_auth on estoque
for all to authenticated
using (meu_perfil() = 'gestor' or farmacia_id = minha_farmacia_id())
with check (meu_perfil() = 'gestor' or farmacia_id = minha_farmacia_id());

create policy pedido_select_auth on pedidos
for select to authenticated
using (meu_perfil() = 'gestor' or farmacia_id = minha_farmacia_id());

create policy pedido_write_auth on pedidos
for all to authenticated
using (meu_perfil() = 'gestor' or farmacia_id = minha_farmacia_id())
with check (meu_perfil() = 'gestor' or farmacia_id = minha_farmacia_id());

create policy moto_select_auth on motoboys
for select to authenticated
using (meu_perfil() in ('gestor','contador'));
