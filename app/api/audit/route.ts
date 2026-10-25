import { NextRequest, NextResponse } from "next/server";
import { auditCsv } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Envie um arquivo CSV no campo 'file'." }, { status: 400 });
    }
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: "Arquivo maior que 25 MB. Divida o CSV em partes antes de importar." }, { status: 413 });
    }
    const text = await file.text();
    const result = auditCsv(text, file.name);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível processar este arquivo.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
