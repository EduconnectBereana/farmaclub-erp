# 📋 GUIA DE APLICAÇÃO — Rebranding FarmaClub → Farma do Bairro

Este ZIP contém **21 arquivos atualizados** com o novo nome da marca "Farma do Bairro".

## ✅ O que foi alterado

### Textos visíveis (aparece pro usuário)
- Todos os `<title>` das páginas → "Farma do Bairro — ..."
- Todas as meta descriptions → nova marca
- Cabeçalhos, rodapés, títulos visíveis → "Farma do Bairro"
- Textos institucionais ("© 2026 Farma do Bairro Itaperuna")
- **Rodapé legal**: "FarmaClub Gestão e Tecnologia Ltda" → "VMV Ventures Ltda"
- PIX merchant name: "FarmaClub" → "Farma do Bairro"

### Código interno (não aparece pro usuário)
- `window.FARMACLUB` → `window.FARMADOBAIRRO`
- `typeof FARMACLUB` → `typeof FARMADOBAIRRO`
- Strings `"FarmaClub"` → `"Farma do Bairro"`
- Console logs `[SW FarmaClub]` → `[SW Farma do Bairro]`
- Cache do Service Worker: `farmaclub-v1.2` → `farmadobairro-v2.0` (força re-download nos clientes)

### Referências à imagem
- `farmaclub_logo.png` → `farma-do-bairro-logo.png` (em todos os HTMLs)

### URLs institucionais
- `farmaclub-erp.vercel.app` → `farmadobairro.com.br` (nos textos)

## ❌ O que NÃO foi alterado (intencional)

- **Nomes dos arquivos HTML/JS/CSS**: `farmaclub_app_cliente.html`, etc.
  - Motivo: renomear arquivos exigiria atualizar `vercel.json` + todas as pastas de rotas + service worker + manifests + hrefs em todos os HTMLs. Alto risco de quebrar deploy.
  - Recomendação: renomear arquivos fica como **sprint futura dedicada**.

- **Chaves de localStorage** `fc_*` (ex: `fc_farmacia_logada`, `fc_campanhas`)
  - Motivo: trocar agora não traz benefício pro usuário. Não quebra nada.

- **Classes CSS** `fc-*` (ex: `.fc-box`, `.fc-kv`)
  - Motivo: trabalho extenso, zero impacto visual ou funcional.

- **`vercel.json`**: inalterado porque as rotas apontam pros arquivos existentes.

- **`farmaclub_logo.png`**: mantido na pasta (arquivo antigo). Você pode deletar depois que confirmar que tudo funciona com a nova logo `farma-do-bairro-logo.png`.

## 🚀 Como aplicar (passo a passo)

### Passo 1 — Backup (recomendado)
Antes de mexer no projeto, no GitHub Desktop clique em **Current Branch → New branch** e crie um branch chamado `backup-antes-rebranding`. Isso te permite voltar se algo der errado.

Depois volta pro branch `main` pra continuar.

### Passo 2 — Copiar arquivos
1. Extraia o ZIP deste pacote em uma pasta temporária
2. Abra a pasta do projeto (GitHub Desktop → Show in Explorer)
3. **Copia e cola TODOS os arquivos extraídos sobre a pasta do projeto**
4. Quando o Windows perguntar "Substituir arquivos?", confirme **Sim pra todos**

### Passo 3 — Verificar no GitHub Desktop
1. Volta pro GitHub Desktop
2. Aba **Changes** deve mostrar **21 arquivos modificados**
3. Cada arquivo tem ✓ ao lado
4. No campo **Summary** escreve:
   ```
   feat: rebranding FarmaClub para Farma do Bairro
   ```
5. No campo **Description** (opcional):
   ```
   - Atualizar textos visíveis em todos os canais
   - Renomear window.FARMACLUB para window.FARMADOBAIRRO
   - Atualizar referências de logo para farma-do-bairro-logo.png
   - Atualizar rodapé para VMV Ventures Ltda
   - Cache do Service Worker versionado para v2.0
   ```

### Passo 4 — Commit e push
1. Clica em **Commit to main**
2. Depois clica em **Push origin** (no topo)
3. Aguarda 1-2 minutos
4. Vercel faz deploy automático

### Passo 5 — Testar
Em aba anônima:
- `https://farmaclub-erp.vercel.app/site` → deve mostrar "Farma do Bairro"
- `https://farmaclub-erp.vercel.app/comprar` → app do cliente com nova marca
- `https://farmaclub-erp.vercel.app/erp` → ERP com nova marca
- Verifica se a nova logo aparece (o arquivo `farma-do-bairro-logo.png` já está no repositório)

## 🔄 Se algo der errado

Se alguma página não carregar ou mostrar logo quebrada:

1. No GitHub Desktop, aba **History**
2. Encontra o commit anterior ao rebranding
3. Clica com botão direito → **Revert this commit**
4. Isso desfaz o rebranding e o sistema volta ao estado anterior

## 📌 Próximos passos após o rebranding

1. ✅ **Rebranding aplicado** (este pacote)
2. ⏳ Apontar DNS de `farmadobairro.com.br` pra Vercel
3. ⏳ Configurar Supabase com chave real em `public/runtime-config.js`
4. ⏳ Rodar SQLs no Supabase
5. ⏳ Primeiro teste end-to-end com farmácia piloto

---

**Arquivos neste pacote:** 21 arquivos  
**Data de geração:** 24/04/2026  
**Próxima sessão:** renomear arquivos de `farmaclub_*` para `farmadobairro_*` (opcional, sprint dedicada)
