# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## O que é o MapDISC

Plataforma de análise comportamental DISC aplicada a funções profissionais. Composta por dois produtos em um único repositório:

- **Painel web** (`/`) — dashboard React para gestores: cadastro de empresa, envio de convites, visualização de perfis DISC e adequação por função
- **Avaliação mobile** (`/teste`) — teste DISC para funcionários, HTML puro, PWA, mobile-first

**Produção:**
- Painel: https://mapdisc.vercel.app
- Mobile: https://mapdisc.vercel.app/teste

---

## Comandos

Todos executados dentro de `painel/`:

```bash
npm run dev      # Vite (porta 5173) + servidor Node (porta 3002) em paralelo
npm run server   # Só o servidor Node local
npm run build    # Build de produção → dist/
npm run preview  # Preview do build local
```

**Deploy para produção** — sempre da raiz `MapDISC/` (não de dentro de `painel/`):
```bash
npx vercel --prod --yes
```

> ⚠️ Rodar `vercel` de dentro de `painel/` causa erro de path duplicado (`painel/painel`). Sempre rodar da raiz.

---

## Arquitetura geral

```
MapDISC/
├── painel/
│   ├── api/index.js          ← Backend completo (função serverless Vercel)
│   ├── server.js             ← Servidor Express para desenvolvimento local
│   ├── src/
│   │   ├── App.jsx           ← Rotas + ProtectedRoute
│   │   ├── AppAuthProvider.jsx  ← Context JWT (hook useAuth)
│   │   ├── api/client.js     ← fetch wrapper com auto-logout em 401
│   │   ├── components/
│   │   │   └── Layout.jsx    ← Sidebar + nav + Outlet
│   │   └── pages/            ← Dashboard, Employees, EmployeeDetail,
│   │                            Invitations, Settings, Login, Register
│   ├── public/
│   │   ├── logo.png          ← Logo MapDISC PNG sem fundo (fonte: Imagens/MapDISC (1).png)
│   │   └── teste/
│   │       ├── index.html    ← Avaliação mobile (HTML/CSS/JS puro, PWA)
│   │       ├── logo.png      ← Cópia da logo para o mobile
│   │       ├── manifest.json
│   │       └── sw.js
│   └── vercel.json           ← Rewrites: /api→serverless, /teste→HTML, *→SPA
├── Imagens/
│   └── MapDISC (1).png       ← Fonte original da logo (sempre usar este)
├── backend/                  ← Backend Node/MongoDB legado (não deployado)
└── CLAUDE.md
```

### Por que dois backends?
- `backend/` — servidor Node+MongoDB original, roda localmente na porta 3002
- `painel/api/index.js` — função serverless para Vercel, usa **Vercel Blob** como banco

Em produção, **somente `api/index.js` é usado**. O `backend/` e `server.js` são apenas para desenvolvimento local.

---

## Backend (`painel/api/index.js`)

### Banco de dados — Vercel Blob como JSON DB

Cada coleção é um array JSON salvo como blob em `db/{colecao}.json`. Funções internas:

```js
readCollection(name)            // GET db/{name}.json do blob → array
writeCollection(name, data)     // PUT array como db/{name}.json no blob
dbFind(col, query)              // filtra por igualdade de campos
dbFindOne(col, query)           // primeiro resultado
dbInsert(col, doc)              // push + writeCollection
dbUpdateOne(col, query, update) // merge parcial no primeiro match
dbDeleteOne(col, query)         // splice + writeCollection
dbDeleteMany(col, query)        // filter + writeCollection
```

Coleções existentes: `companies`, `employees`, `invitations`, `discResults`

**Leitura de blob privado** — exige token no header:
```js
fetch(url, { headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` } })
```
O `BLOB_READ_WRITE_TOKEN` é injetado automaticamente pelo Vercel em produção. Localmente não existe — o blob não funciona offline (use o `server.js` local que tem sua própria lógica).

### Rotas da API

```
POST   /api/auth/register               Criar empresa (name, email, password)
POST   /api/auth/login                  Login (email, password)
GET    /api/auth/me                   ✓ Dados da empresa logada

POST   /api/invitations               ✓ Criar convite (employeeName, employeeEmail)
GET    /api/invitations               ✓ Listar convites da empresa
DELETE /api/invitations/:id           ✓ Cancelar convite
GET    /api/invitations/public/:token   Validar token (usado pelo mobile)

GET    /api/employees                 ✓ Listar funcionários + discResult embutido
GET    /api/employees/:id             ✓ Detalhe + discResult
DELETE /api/employees/:id             ✓ Remover funcionário e seus resultados

POST   /api/disc/submit                 Enviar respostas (invitationToken, employeeData, responses[24])
GET    /api/dashboard/stats           ✓ Estatísticas (totais, DISC médio, adequação média)
```
`✓` = requer header `Authorization: Bearer {jwt}`

### Lógica DISC

**Mapeamento letra → fator DISC:**
```
A → D (Dominante)   B → I (Influente)
C → S (Estável)     D → C (Consciencioso)
```

**Pontuação:** 24 grupos × (most +1, least −1) → scores `{D, I, S, C}`

**Normalização:**
```js
raw[k] = ((score + 24) / 48) * 100   // coloca em 0–100
normalized[k] = (raw[k] / sum) * 100  // soma = 100%
```

**Adequação por função:** correlação de Pearson entre perfil do funcionário e `FUNCTION_PROFILES[fn]` → resultado 0–100%.

**Perfis ideais por função** (referência em `FUNCTION_PROFILES`):
```
Vendas D=70 I=85 S=40 C=30    Liderança  D=90 I=60 S=50 C=40
Atendimento D=35 I=70 S=85 C=40    Financeiro D=30 I=25 S=60 C=90
Marketing D=55 I=80 S=30 C=45    Operações D=50 I=30 S=75 C=70
RH D=40 I=75 S=80 C=45    TI D=35 I=25 S=55 C=85
Produção D=55 I=25 S=75 C=65    Administração D=45 I=40 S=65 C=75
Ensino D=35 I=80 S=70 C=40    Criativo D=45 I=65 S=30 C=70
```

---

## Frontend React

### Autenticação
- `AppAuthProvider.jsx` gerencia estado JWT com `localStorage` (`mapdisc_token`, `mapdisc_user`)
- `useAuth()` → `{ token, user, login, logout, isAuthenticated }`
- `api/client.js` intercepta respostas 401 → `logout()` → redirect `/login`
- `ProtectedRoute` em `App.jsx` bloqueia rotas sem autenticação

### Proxy de desenvolvimento
`vite.config.js` redireciona `/api/*` → `http://localhost:3002`

### Tailwind — classes customizadas (definidas em `src/index.css`)
`input`, `label`, `btn-primary`, `btn-secondary`, `card`, `badge`

### Cores padrão do projeto
```js
primary:       '#6C3AED'  // violeta
primary-dark:  '#4C1D95'
primary-light: '#8B5CF6'
success:       '#10B981'  // verde

// Cores DISC (usadas em frontend e mobile):
D: '#EF4444'  I: '#F59E0B'  S: '#10B981'  C: '#3B82F6'
```

---

## Mobile (`public/teste/index.html`)

HTML/CSS/JS puro, sem dependências externas. Telas em sequência:

```
welcome → personal → functions → test (24 grupos) → processing → result
```

Cada tela é uma `<div class="screen">`, alternadas com `goToScreen(id)`.

**Bug histórico corrigido:** `renderQuestion()` usava `s.factor` (inexistente) como `data-factor`. Corrigido para `s.letter`. Sem isso, todas as marcações de "Menos como eu" falham silenciosamente.

**Token de convite via URL:** `?token={uuid}` — pré-preenche nome/email do funcionário chamando `GET /api/invitations/public/:token`.

**Perguntas:** 24 grupos em `QUESTIONS[]`, cada grupo tem 4 `{letter, text}`. As afirmações são embaralhadas por grupo a cada teste (`shuffleArray`).

---

## Vercel — configuração de deploy

### `vercel.json` (em `painel/`)
```json
{
  "buildCommand": "vite build",
  "outputDirectory": "dist",
  "functions": { "api/index.js": { "maxDuration": 30 } },
  "rewrites": [
    { "source": "/api/(.*)",          "destination": "/api/index.js" },
    { "source": "/teste",             "destination": "/teste/index.html" },
    { "source": "/((?!api/|teste/).*)", "destination": "/index.html" }
  ]
}
```

### IDs do projeto (`.vercel/project.json`)
```json
{ "orgId": "team_JwiAnQbjaowtPHJhJKjyidXt", "projectId": "prj_ckS8HE0X7GNzbFfeRB1N9y9LUDJQ" }
```

### Blob Store
- Nome: `mapdisc-db` | ID: `store_wsWbe75pdPq5Nk9q` | Região: `iad1` | Acesso: `private`
- Já vinculado ao projeto — `BLOB_READ_WRITE_TOKEN` é injetado automaticamente

### Variáveis de ambiente em produção
| Variável | Valor |
|----------|-------|
| `JWT_SECRET` | `mapdisc-prod-secret-xY7kL9mN2024` |
| `BLOB_READ_WRITE_TOKEN` | *(gerenciado pelo Vercel — não exposto)* |
| `NODE_ENV` | `vercel` |

---

## GitHub

- Repositório: `https://github.com/thiagoferrazcriacao-coder/mapdisc`
- Branch principal: `main`
- Credenciais salvas no remote (não precisam ser reconfiguradas se a pasta for copiada)

---

## Continuando em outra máquina

### 1. Copiar
Copie toda a pasta `MapDISC/` — ela contém tudo, incluindo `.vercel/project.json` que identifica o projeto Vercel.

### 2. Instalar dependências
```bash
cd MapDISC/painel
npm install
```

### 3. Autenticar Vercel CLI
```bash
npx vercel login
# Usar a conta: thiagoferrazcriacao-1520
# O .vercel/project.json já identifica o projeto automaticamente
```

### 4. Autenticar Git (se necessário)
```bash
git remote set-url origin https://{seu-token-github}@github.com/thiagoferrazcriacao-coder/mapdisc.git
```

### 5. Rodar local
```bash
npm run dev
# Painel: http://localhost:5173
# API: http://localhost:3002
```

> O banco de dados (Vercel Blob) está na nuvem — os dados de usuários, funcionários e resultados DISC persistem automaticamente entre máquinas e deploys.

---

## Hook de deploy automático (`.claude/settings.local.json`)

Configurado para fazer deploy automaticamente após edições em `painel/src/` ou `painel/public/`:
```powershell
# Roda após cada Edit/Write nessas pastas:
npx vercel --prod --yes   # a partir de MapDISC/
```
Requer que o Claude Code seja reiniciado para o hook ser carregado. Use `/hooks` para verificar.
