# 🔌 SUPABASE — Conectando o sistema ao banco de dados real

Este pacote tem 2 arquivos que vão conectar seu sistema Farma do Bairro ao Supabase usando o NOVO formato de chaves (Publishable key).

## Arquivos no pacote

1. **runtime-config.js** → vai pra pasta `/public/` do projeto
2. **farmaclub_supabase.js** → vai pra pasta `/shared/` do projeto

---

## Como aplicar (15 minutos)

### PASSO 1 — Copiar a Publishable key do Supabase (1 min)

1. No painel Supabase, na aba **"Publishable and secret API keys"**
2. Localiza a linha **"default"** sob **"Publishable key"**
3. Clica no ícone de copiar (📋) à direita da chave
4. A chave fica copiada na área de transferência

A chave começa com `sb_publishable_...` e tem cerca de 50 caracteres.

### PASSO 2 — Substituir o runtime-config.js (3 min)

1. Abre a pasta do projeto (GitHub Desktop → Show in Explorer)
2. Vai na subpasta **`public/`**
3. Acha o arquivo **`runtime-config.js`** (deve já existir lá)
4. Renomeia ele pra `runtime-config-OLD.js` (backup, não apaga)
5. Cola o **runtime-config.js** novo deste ZIP nessa pasta
6. **Abre o arquivo novo no Notepad/VS Code**
7. Localiza a linha:
   ```
   supabasePublishableKey: "SEU_PUBLISHABLE_KEY_AQUI",
   ```
8. **Substitui** `SEU_PUBLISHABLE_KEY_AQUI` pela sua chave (aquela copiada no Passo 1)
9. **Importante:** mantém as ASPAS DUPLAS antes e depois da chave
10. Salva (Ctrl+S)

Exemplo de como deve ficar (chave simulada):
```javascript
supabasePublishableKey: "sb_publishable_FidUGTjUCcIjGHU_uNJBUA_AKHYwExemplo123",
```

### PASSO 3 — Substituir o farmaclub_supabase.js (2 min)

1. Volta pra pasta do projeto
2. Vai na subpasta **`shared/`**
3. Acha o arquivo **`farmaclub_supabase.js`**
4. Renomeia ele pra `farmaclub_supabase-OLD.js` (backup)
5. Cola o **farmaclub_supabase.js** novo deste ZIP

Esse arquivo NÃO precisa ser editado. Ele já está pronto.

### PASSO 4 — Commit + Push pelo GitHub Desktop (3 min)

1. Abre o GitHub Desktop
2. Aba **Changes** vai mostrar 2-4 arquivos modificados:
   - `public/runtime-config.js` (modificado)
   - `public/runtime-config-OLD.js` (novo, é o backup)
   - `shared/farmaclub_supabase.js` (modificado)
   - `shared/farmaclub_supabase-OLD.js` (novo, é o backup)
3. Marca todos com ✓
4. Summary: `feat: conectar Supabase com Publishable key`
5. Clica em **Commit to main**
6. Clica em **Push origin** no topo
7. Aguarda 1-2 minutos pro Vercel fazer deploy

### PASSO 5 — Testar conexão (2 min)

Abre em aba anônima:
```
https://farmaclub-erp.vercel.app/setup
```

A página deve abrir. Olha no canto/console do navegador (F12 → Console). Deve aparecer:
```
🟢 FC_CONFIG carregado: Farma do Bairro v1.0.0
🟢 Supabase carregado: https://eswwvonedfexvxlzkoof.supabase.co
```

Se aparecer essas duas mensagens em VERDE, está funcionando.

Se aparecer mensagem amarela ⚠️ "Supabase não configurado", a chave não foi colada corretamente.

### PASSO 6 — Próximo: rodar SQLs (10 min)

Depois que confirmou que a conexão tá funcionando, próximo passo é criar as tabelas. Volta pro chat com Claude e pede pra continuar.

---

## ⚠️ ATENÇÃO

- A **Publishable key** é segura no front-end. Pode ficar visível no código do site.
- A **Secret key** NUNCA deve ir pro front-end. Deixa só em servidor.
- Se desconfiar que a chave vazou, no Supabase você pode revogar e gerar nova.

---

## Estrutura esperada da pasta

```
projeto/
├── apps/
│   └── (HTMLs)
├── public/
│   ├── runtime-config.js          ← NOVO (deste ZIP)
│   ├── runtime-config-OLD.js      ← backup do antigo
│   └── ...
├── shared/
│   ├── farmaclub_supabase.js      ← NOVO (deste ZIP)
│   ├── farmaclub_supabase-OLD.js  ← backup do antigo
│   └── ...
└── ...
```

---

**Geração:** 26/04/2026
**Próxima sessão:** rodar SQLs (criar tabelas) + cadastrar primeira farmácia teste
