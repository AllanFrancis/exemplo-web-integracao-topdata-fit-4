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
    // Nitro e o que faz o build sair no formato que a Vercel entende (.vercel/output)
    // e o que serve o WebSocket do contrato. O handler e registrado a mao porque o
    // TanStack Start e o dono do `src/routes`, entao a varredura de rotas do proprio
    // Nitro nao acontece neste projeto.
    nitro({
      features: { websocket: true },
      handlers: [{ route: "/gateway/ws", handler: "./src/server/ws-gateway.ts" }],
    }),
    react(),
    tailwindcss(),
  ],
});
