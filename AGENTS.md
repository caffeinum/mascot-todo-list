# agent guide

## commands
- `bun run dev` - dev mode with watch
- `bun run build` - build renderer + main
- `bun test` - run all tests
- `bun test <file>` - run single test file
- `bun run start` - start electron app

## code style
- typescript strict mode enabled
- use `import type` for type-only imports
- prefer `const` over `let`, arrow functions
- react: functional components, hooks (useState, useEffect, useMemo, useRef)
- inline styles with explicit types (use `as any` for webkit properties)
- no semicolons, no unused vars allowed in final code
- camelCase for variables/functions, PascalCase for components/types

## architecture
- electron app: main process (src/main), preload (src/preload), renderer (src/renderer)
- bun builds tsx -> public/ for renderer
- use bun apis over node equivalents (Bun.file, not fs)
- custom hooks in src/renderer/hooks/
- types inline or extracted to type aliases
