import { createHash } from "node:crypto";

export type AuditRow = {
  section: string;
  voteCode: string;
  candidate: string;
  votes: number;
};

export type AuditResult = {
  sourceFile: string;
  sha256: string;
  bytes: number;
  rowsRead: number;
  sections: number;
  candidates: { name: string; votes: number }[];
  blankVotes: number;
  nullVotes: number;
  otherRows: number;
  duplicateKeys: string[];
  warnings: string[];
  importedAt: string;
  method: string;
};

function normalize(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function parseCsvLine(line: string, delimiter: string): string[] {
  const fields: string[] = [];
  let value = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') { value += '"'; i++; }
      else quoted = !quoted;
    } else if (ch === delimiter && !quoted) {
      fields.push(value.trim()); value = "";
    } else value += ch;
  }
  fields.push(value.trim());
  return fields;
}

export function auditCsv(text: string, sourceFile: string): AuditResult {
  const cleanText = text.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  const lines = cleanText.split("\n").filter((line) => line.trim().length > 0);
  if (lines.length < 2) throw new Error("O CSV precisa ter cabeçalho e ao menos uma linha de dados.");

  const delimiter = (lines[0].match(/;/g) || []).length > (lines[0].match(/,/g) || []).length ? ";" : ",";
  const headers = parseCsvLine(lines[0], delimiter).map(normalize);
  const findColumn = (names: string[]) => headers.findIndex((h) => names.some((name) => h === normalize(name) || h.includes(normalize(name))));
  const sectionIndex = findColumn(["NR_SECAO", "numero da secao", "seção", "secao"]);
  const candidateIndex = findColumn(["NM_VOTAVEL", "nome do candidato", "candidato", "nome"]);
  const codeIndex = findColumn(["NR_VOTAVEL", "numero do candidato", "codigo do voto", "cod_votavel"]);
  const votesIndex = findColumn(["QT_VOTOS", "quantidade de votos", "qtd votos", "votos"]);
  if (sectionIndex < 0 || votesIndex < 0 || (candidateIndex < 0 && codeIndex < 0)) {
    throw new Error("Cabeçalhos não reconhecidos. Preciso de coluna de seção (NR_SECAO), votos (QT_VOTOS) e candidato (NM_VOTAVEL ou NR_VOTAVEL). Confira se é o CSV de votação por seção do TSE.");
  }

  const totals = new Map<string, number>();
  const sections = new Set<string>();
  const seen = new Set<string>();
  const duplicateKeys = new Set<string>();
  const warnings: string[] = [];
  let blankVotes = 0;
  let nullVotes = 0;
  let otherRows = 0;
  let rowsRead = 0;

  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i], delimiter);
    if (cells.length !== headers.length) {
      warnings.push(`Linha ${i + 1}: número de campos diferente do cabeçalho; mantida fora do cálculo automático.`);
      continue;
    }
    const section = cells[sectionIndex]?.trim();
    const candidate = (candidateIndex >= 0 ? cells[candidateIndex] : cells[codeIndex])?.trim();
    const code = codeIndex >= 0 ? cells[codeIndex]?.trim() : candidate;
    const votesText = cells[votesIndex]?.trim().replace(/\./g, "").replace(",", ".");
    const votes = Number(votesText);
    if (!section || !candidate || !Number.isSafeInteger(votes) || votes < 0) {
      warnings.push(`Linha ${i + 1}: seção, candidato/código ou quantidade de votos inválida; mantida fora do cálculo automático.`);
      continue;
    }
    rowsRead++;
    sections.add(section);
    const key = `${section}|${code || candidate}`;
    if (seen.has(key)) duplicateKeys.add(key);
    seen.add(key);

    const label = normalize(candidate);
    if (label.includes("branco") || label.includes("voto em branco")) blankVotes += votes;
    else if (label.includes("nulo") || label.includes("voto nulo")) nullVotes += votes;
    else if (label.includes("nao compareceu") || label.includes("abstencao") || label.includes("abstencao")) {
      otherRows += votes;
      warnings.push("A fonte contém uma linha com rótulo de abstenção. Ela foi separada de votos em candidatos; confira o dicionário oficial antes de interpretar esse campo.");
    } else {
      const displayName = candidate || code;
      totals.set(displayName, (totals.get(displayName) || 0) + votes);
    }
  }

  if (rowsRead === 0) throw new Error("Nenhuma linha válida foi encontrada; nenhum total foi publicado.");
  if (duplicateKeys.size) warnings.push(`${duplicateKeys.size} chave(s) seção+candidato repetida(s). Os valores foram preservados na soma e sinalizados; não foram apagados automaticamente.`);
  if (warnings.length === 0) warnings.push("Nenhuma inconsistência estrutural detectada nas verificações básicas. Isso não certifica a autenticidade da fonte nem exclui manipulação.");
  const sha256 = createHash("sha256").update(Buffer.from(cleanText, "utf8")).digest("hex");

  return {
    sourceFile,
    sha256,
    bytes: Buffer.byteLength(cleanText, "utf8"),
    rowsRead,
    sections: sections.size,
    candidates: [...totals.entries()].map(([name, votes]) => ({ name, votes })).sort((a, b) => b.votes - a.votes),
    blankVotes,
    nullVotes,
    otherRows,
    duplicateKeys: [...duplicateKeys],
    warnings,
    importedAt: new Date().toISOString(),
    method: "Soma determinística de QT_VOTOS por rótulo/código; validação estrutural básica; SHA-256 do conteúdo recebido. Não é certificação de autenticidade nem detecção conclusiva de fraude."
  };
}
