# Workspace

## Overview

pnpm workspace monorepo using TypeScript. AI Studio web app with text generation (chat) and image generation powered by OpenAI via Replit AI Integrations.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **AI**: OpenAI via Replit AI Integrations (gpt-5.4 for chat, gpt-image-1 for images)
- **Frontend**: React + Vite, TanStack Query, Wouter routing, shadcn/ui, Tailwind CSS

## Artifacts

- **ai-studio** (`/`): Main web app — AI chat and image generation studio
- **api-server** (`/api`): Express API server

## Features

- **Chat Studio**: Create conversations, send messages with real-time SSE streaming responses using gpt-5.4
- **Image Studio**: Generate images from text prompts using gpt-image-1, view gallery of past generations

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Database Tables

- `conversations` — AI chat conversations
- `messages` — Messages within conversations (user and assistant)
- `generated_images` — Generated images with prompt and base64 data

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
