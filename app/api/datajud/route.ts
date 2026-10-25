import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const DATAJUD_URL = "https://api-publica.datajud.cnj.jus.br/api_publica_trese/_search";
const PUBLIC_API_KEY = process.env.DATAJUD_API_KEY || "cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==";

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("numero") || "";
  const numero = raw.replace(/\\D/g, "");
  if (!/^\\d{20}$/.test(numero)) {
    return NextResponse.json({ error: "Informe o número CNJ completo, com 20 dígitos." }, { status: 400 });
  }

  try {
    const response = await fetch(DATAJUD_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `APIKey ${PUBLIC_API_KEY}`,
      },
      body: JSON.stringify({
        query: { term: { numeroProcesso: numero } },
        size: 1,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: response.status === 401 || response.status === 403
          ? "O DataJud recusou a chave de acesso."
          : `O DataJud respondeu com status ${response.status}.` },
        { status: response.status === 404 ? 404 : 502 },
      );
    }

    const payload = await response.json();
    const hit = payload?.hits?.hits?.[0]?._source;
    if (!hit) {
      return NextResponse.json({ found: false, source: "CNJ · DataJud", message: "Nenhum registro público foi encontrado para esse número." });
    }

    const result = {
      found: true,
      source: "CNJ · DataJud",
      fetchedAt: new Date().toISOString(),
      process: {
        number: hit.numeroProcesso ?? numero,
        tribunal: hit.tribunal ?? null,
        degree: hit.grau ?? null,
        class: hit.classe?.nome ?? null,
        classCode: hit.classe?.codigo ?? null,
        subjects: Array.isArray(hit.assuntos) ? hit.assuntos.map((x: any) => x.nome).filter(Boolean) : [],
        court: hit.orgaoJulgador?.nome ?? null,
        filingDate: hit.dataAjuizamento ?? null,
        lastUpdate: hit.dataHoraUltimaAtualizacao ?? null,
        system: hit.sistema?.nome ?? null,
        movements: Array.isArray(hit.movimentos) ? hit.movimentos.slice(-12).reverse().map((m: any) => ({
          date: m.dataHora ?? null,
          name: m.nome ?? m.complementosTabelados?.map((x: any) => x.nome).filter(Boolean).join(" · ") ?? "Movimentação",
          code: m.codigo ?? null,
        })) : [],
      },
    };
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Não foi possível consultar o DataJud agora. Tente novamente em instantes." }, { status: 502 });
  }
}
