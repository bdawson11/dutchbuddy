import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

// Strip authoring docs (style guides, character bibles, handoffs) from the
// build — public/ ships verbatim, so these .md files would otherwise land in
// dist/packs/. Runs after the bundle is written.
function stripPackDocs() {
  return {
    name: 'strip-pack-docs',
    closeBundle() {
      const packsDir = path.resolve('dist', 'packs')
      if (!fs.existsSync(packsDir)) return
      const walk = (dir) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          const full = path.join(dir, entry.name)
          if (entry.isDirectory()) walk(full)
          else if (entry.name.endsWith('.md')) fs.rmSync(full)
        }
      }
      walk(packsDir)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), stripPackDocs()],
})
