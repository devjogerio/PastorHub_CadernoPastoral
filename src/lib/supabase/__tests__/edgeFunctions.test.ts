import { describe, it, expect, vi } from "vitest";

vi.mock("../../supabase", () => {
  return {
    isSupabaseConfigured: vi.fn(() => true),
    supabase: {
      functions: {
        invoke: vi.fn(async (_name: string, _opts: any) => ({
          data: {
            sermon: {
              id: "s-123",
              titulo: "Gerado",
              texto_biblico: "João 3:16",
              tema: "Amor",
              publico_alvo: "Geral",
              tipo_sermao: "Expositivo",
              conteudo_html: "<p>...html...</p>",
              conteudo_plain: "...plain...",
              tags: [],
              data_criacao: new Date().toISOString(),
              data_pregado: null,
              status_pregado: false,
              local_pregado: "",
            },
          },
          error: null,
        })),
      },
    },
  };
});

import { generateSermonWithAI } from "../edgeFunctions";

describe("Edge Function generateSermonWithAI", () => {
  it("retorna sermão gerado com campos esperados", async () => {
    const sermon = await generateSermonWithAI({
      texto_biblico: "João 3:16",
      tema: "Amor",
      publico_alvo: "Geral",
      tipo_sermao: "Expositivo",
    });
    expect(sermon.id).toBe("s-123");
    expect(sermon.titulo).toBe("Gerado");
    expect(sermon.texto_biblico).toBe("João 3:16");
  });
});

