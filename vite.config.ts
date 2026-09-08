import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

/** A Vercel define `VERCEL=1` na maquina de build. */
const emVercel = Boolean(process.env["VERCEL"]);

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    tanstackStart({ server: { entry: "server" } }),
    // Nitro e o que faz o build sair no formato que a Vercel entende (.vercel/output)
    // e o que serve o WebSocket do contrato.
    //
    // O handler e registrado a mao porque o TanStack Start e o dono do `src/routes`, e
    // a varredura de rotas do proprio Nitro nao acontece neste projeto.
    //
    // A rota tem duas implementacoes porque o aperto de mao muda com o destino: o
    // WebSocket nativo do Nitro funciona no servidor local, mas o preset da Vercel o
    // descarta ao gerar as funcoes — publicado, quem levanta o socket e a API da
    // plataforma. O que acontece depois de aberto e o mesmo nos dois casos.
    nitro({
      features: { websocket: !emVercel },
      handlers: [
        {
          route: "/gateway/ws",
          handler: emVercel ? "./src/server/ws-vercel.ts" : "./src/server/ws-nitro.ts",
        },
      ],
    }),
    react(),
    tailwindcss(),
  ],
});
