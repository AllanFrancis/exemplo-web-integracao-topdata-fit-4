import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    tanstackStart({ server: { entry: "server" } }),
    // Nitro e o que faz o build sair no formato que a Vercel entende (.vercel/output).
    // Sem ele, o `dist/` gerado nao vira funcao serverless nenhuma.
    nitro(),
    react(),
    tailwindcss(),
  ],
});
