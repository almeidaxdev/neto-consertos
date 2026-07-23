# Neto Consertos — Assistência Técnica

Sistema completo de gestão para assistência técnica: serviços, pagamentos, dashboard financeiro e busca — mobile first, com backend real em Supabase.

## Stack

- React + TypeScript + Vite
- TailwindCSS (design system próprio, inspirado em Nubank/iFood/Notion)
- React Router, React Query, React Hook Form + Zod
- Framer Motion, Recharts, Lucide Icons
- Supabase (Postgres + Auth + RLS)

## 1. Criar o projeto no Supabase

1. Crie uma conta em https://supabase.com e um novo projeto.
2. Vá em **SQL Editor** e execute todo o conteúdo do arquivo `supabase/schema.sql` deste repositório. Isso cria as tabelas `services` e `payments`, os enums, triggers, views financeiras e as políticas de segurança (RLS).
3. Vá em **Authentication > Providers** e confirme que **Email** está habilitado.
4. Vá em **Authentication > Users** e crie o usuário que vai acessar o sistema (ex: e-mail e senha da assistência técnica). Você pode criar quantos usuários quiser — cada um só vê os próprios dados, graças ao RLS.
5. Vá em **Project Settings > API** e copie a **Project URL** e a **anon public key**.

## 2. Configurar o projeto localmente

```bash
# instalar dependências
npm install

# copiar o arquivo de variáveis de ambiente
cp .env.example .env
```

Edite o `.env` e cole a URL e a chave copiadas do Supabase:

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

## 3. Rodar em desenvolvimento

```bash
npm run dev
```

Acesse http://localhost:5173 — faça login com o usuário criado no passo 1.4.

## 4. Build de produção

```bash
npm run build
npm run preview
```

O resultado fica em `dist/`, pronto para publicar em qualquer hospedagem estática (Vercel, Netlify, Cloudflare Pages etc). Lembre-se de configurar as mesmas variáveis de ambiente (`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`) no painel da hospedagem escolhida.

## Estrutura do projeto

```
src/
  components/       componentes reutilizáveis (Logo, ServiceCard, BottomNav, etc)
  components/ui/    design system (Button, Card, Input, Sheet, Toast...)
  hooks/             lógica de dados (Supabase + React Query) e auth/tema
  lib/               supabase client, utilitários, validações (zod)
  pages/             telas do app (Dashboard, Serviços, Pagamentos, etc)
  types/             tipos TypeScript compartilhados
supabase/
  schema.sql         modelagem completa do banco (tabelas, views, RLS, triggers)
```

## Funcionalidades implementadas

- **Login** com Supabase Auth (e-mail/senha)
- **Dashboard**: serviços em andamento, finalizados, faturamento e lucro do mês, gráficos dos últimos 6 meses (atualizados automaticamente)
- **Serviços**: listagem com filtro por status, cadastro com número de OS sequencial automático, cálculo automático de lucro (valor do serviço − peças), edição e exclusão
- **Detalhes do serviço**: registrar pagamentos, finalizar serviço, marcar como entregue, editar, excluir
- **Pagamentos**: múltiplos pagamentos por serviço (Pix, dinheiro, cartão, transferência), cálculo automático de valor pago/restante e status (pago/parcial/pendente)
- **Pesquisa**: busca instantânea por cliente, telefone, número de OS ou equipamento
- **Mais**: alternância de tema claro/escuro (persistente), exportação de dados em CSV, sobre o app, logout
- Validação completa de formulários (Zod + React Hook Form), máscara monetária e de telefone, estados de carregamento (skeletons), mensagens de sucesso/erro (toast) e tratamento de erros em todas as operações
- Segurança via Row Level Security: cada usuário só acessa os próprios dados
