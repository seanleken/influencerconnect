# Contributing to InfluencerConnect

Thanks for your interest in contributing! Here's how to get started.

## Development Setup

1. **Fork and clone** the repo
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Set up environment variables** — copy `.env.example` to `.env.local` and fill in the values
4. **Set up the database** — you'll need a [Neon](https://neon.tech) Postgres instance
   ```bash
   npx prisma migrate dev
   ```
5. **Start the dev server**
   ```bash
   npm run dev
   ```

## Making Changes

- The codebase is built in **vertical slices** — see `technical-spec.md` for the full build order and architecture decisions
- Read `CLAUDE.md` for the architecture rules before writing any code
- Run `npx prisma generate` after any changes to `prisma/schema.prisma`
- Run `npm run build` before submitting a PR to catch type errors

## Pull Requests

- Keep PRs focused — one feature or fix per PR
- Reference any related issue in the PR description
- Ensure `npm run build` and `npm run lint` pass

## Reporting Issues

Use the GitHub issue templates for bugs and feature requests. Include as much detail as possible — steps to reproduce, expected vs actual behaviour, and your environment.
