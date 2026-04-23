# MapDISC — Analisador de Perfil Comportamental DISC

## Contexto do Projeto

Sistema SaaS para empresários analisarem se seus funcionários estão na função certa, baseado no perfil DISC e nas atividades que executam. Composto por:

1. **Teste DISC Mobile** — App mobile-first onde o funcionário responde ao teste DISC e descreve suas funções
2. **Painel do Empresário** — Dashboard React para o dono da empresa visualizar resultados e análises
3. **Backend API** — Node.js + Express + MongoDB servindo ambos

## Fluxo Principal

1. Empresário se cadastra no painel → cria sua conta
2. Empresário gera link único para cada funcionário
3. Funcionário abre link no celular → dados pessoais → descreve funções/rotina → teste DISC (24 perguntas escolha forçada)
4. Sistema calcula perfil DISC (D, I, S, C) com gráfico
5. Sistema cruza perfil DISC + funções descritas → gera análise
6. Empresário vê tudo no painel com gráficos e recomendações

## Teste DISC (24 perguntas)

Metodologia: Escolha forçada (most/least) — a mais precisa.

- 24 grupos de 4 afirmações cada
- Em cada grupo: escolhe 1 que MAIS se identifica ("Mais como eu") e 1 que MENOS se identifica ("Menos como eu")
- Cada afirmação mapeia para um fator: D, I, S ou C
- Scoring: "Mais" = +1 no fator, "Menos" = -1 no fator
- Resultado: porcentagens normalizadas de D, I, S, C

## Motor de Análise

Para cada categoria de função, há um perfil DISC ideal (0-100 cada fator):

| Função | D | I | S | C |
|--------|---|---|---|---|
| Vendas | 70 | 85 | 40 | 30 |
| Liderança/Gerência | 90 | 60 | 50 | 40 |
| Atendimento/Suporte | 35 | 70 | 85 | 40 |
| Financeiro/Contabilidade | 30 | 25 | 60 | 90 |
| Marketing | 55 | 80 | 30 | 45 |
| Operações/Logística | 50 | 30 | 75 | 70 |
| Recursos Humanos | 40 | 75 | 80 | 45 |
| TI/Desenvolvimento | 35 | 25 | 55 | 85 |
| Produção/Fábrica | 55 | 25 | 75 | 65 |
| Administração | 45 | 40 | 65 | 75 |
| Ensino/Treinamento | 35 | 80 | 70 | 40 |
| Creative/Design | 45 | 65 | 30 | 70 |

O cálculo de adequação usa correlação de Pearson entre o perfil do funcionário e o perfil ideal da função, convertido para porcentagem (0–100%).

Recomendações: mostra top 3 funções com maior adequação e dicas de melhoria na função atual.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | Node.js + Express + JWT |
| Banco | MongoDB (Mongoose) |
| Painel frontend | React + Vite + Tailwind CSS |
| Teste frontend | HTML/CSS/JS puro (mobile-first PWA) |
| Gráficos | Recharts |
| Deploy | Vercel (frontend) + Railway (backend) |

## Design

- Cor primária: `#6C3AED` (violeta)
- Cor secundária: `#10B981` (verde/emerald para positivo)
- Cor alerta: `#EF4444` (vermelho para inadequado)
- Cor neutra: `#6B7280`
- Background: `#F9FAFB`
- Cards: branco com sombra suave e bordas arredondadas
- Tipografia: system-ui / Inter
- Sidebar: fundo primário violeta
- Componentes: seguir padrão do Vedafácil (btn, btn-primary, input, label, card, badge)

## Variáveis de Ambiente

```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=sua-chave-secreta
PORT=3002
```

## Regras Críticas de UX

- O teste mobile DEVE ser simples, com botões grandes, toque amigável
- Barra de progresso clara durante o teste
- Não permitir voltar (link de uso único)
- Cada grupo: selecionar 1 "Mais" e 1 "Menos" obrigatoriamente antes de avançar
- Resultado do funcionário: resumo simples (perfil dominante + 1 frase)
- Resultado do empresário: análise completa com gráficos, %, sugestões
- Convites expiram em 7 dias

## Ordem de Construção

1. Backend: Models (Company, Employee, Invitation, DISCResult)
2. Backend: Auth routes (registro/login empresário, JWT)
3. Backend: Employee routes (CRUD, convites)
4. Backend: DISC routes (receber respostas, calcular perfil)
5. Backend: Analysis service (motor de análise DISC vs funções)
6. Teste mobile: HTML/CSS/JS completo (dados pessoais → funções → teste DISC → resultado)
7. Painel: Setup React + Vite + Tailwind
8. Painel: Login/Cadastro
9. Painel: Dashboard (visão geral da equipe)
10. Painel: Lista de funcionários com resultados
11. Painel: Detalhe do funcionário (gráficos DISC + análise)
12. Painel: Gerenciar convites