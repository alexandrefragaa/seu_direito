"use client";

import { useMemo, useState } from "react";

type Result = {
  sourceFile: string; sha256: string; bytes: number; rowsRead: number; sections: number;
  candidates: { name: string; votes: number }[]; blankVotes: number; nullVotes: number; otherRows: number;
  duplicateKeys: string[]; warnings: string[]; importedAt: string; method: string;
};
type Tab = "visao" | "metodo" | "auditoria";
const fmt = (n: number) => new Intl.NumberFormat("pt-BR").format(n);
const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export default function Home() {
  const [tab, setTab] = useState<Tab>("visao");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const lula = useMemo(() => result?.candidates.filter(c => norm(c.name).includes("lula")).reduce((s, c) => s + c.votes, 0) ?? null, [result]);
  const flavio = useMemo(() => result?.candidates.filter(c => norm(c.name).includes("flavio")).reduce((s, c) => s + c.votes, 0) ?? null, [result]);
  const filtered = useMemo(() => result?.candidates.filter(c => norm(c.name).includes(norm(search))) ?? [], [result, search]);

  async function importFile() {
    if (!file) { setError("Selecione primeiro o CSV de votação por seção."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const form = new FormData(); form.append("file", file);
      const response = await fetch("/api/audit", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Falha ao processar o CSV.");
      setResult(data as Result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha inesperada ao importar.");
    } finally { setLoading(false); }
  }

  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Seu_direito início">
          <span className="brand-mark">S<span>.</span></span>
          <span>seu_direito<small>OBSERVATÓRIO DE DADOS ELEITORAIS</small></span>
        </a>
        <span className="status"><i /> AUDITORIA EXPERIMENTAL</span>
      </header>

      <section className="intro">
        <p className="eyebrow">CONFERÊNCIA PÚBLICA · MÉTODO ABERTO</p>
        <h1>Os números precisam<br /><em>poder ser conferidos.</em></h1>
        <p className="lead">Importe um arquivo CSV de votação por seção, recalcule os totais com código próprio e confira a origem, a cobertura e os alertas estruturais. A ferramenta não altera votos nem declara fraude automaticamente.</p>
        <div className="notice"><span className="notice-icon">i</span><p><strong>Importante: esta ferramenta ainda não está conectada a uma fonte eleitoral ao vivo.</strong> Os resultados só aparecem depois que você importar um CSV. O processamento acontece nesta requisição e não cria um arquivo público permanente nem garante que a fonte seja autêntica.</p></div>
      </section>

      <nav className="tabs" aria-label="Seções do painel">
        <button className={tab === "visao" ? "active" : ""} onClick={() => setTab("visao")}>Importar e conferir</button>
        <button className={tab === "metodo" ? "active" : ""} onClick={() => setTab("metodo")}>Como calculamos</button>
        <button className={tab === "auditoria" ? "active" : ""} onClick={() => setTab("auditoria")}>Trilha de auditoria</button>
      </nav>

      {tab === "visao" && <section className="content">
        <div className="section-heading"><div><p className="eyebrow">IMPORTAÇÃO DE FONTE</p><h2>Recalcular arquivo CSV</h2></div><span className="pill muted">MÁX. 25 MB</span></div>
        <div className="upload-panel">
          <label className="file-label" htmlFor="csv-file">Arquivo CSV de votação por seção</label>
          <input id="csv-file" type="file" accept=".csv,text/csv" onChange={e => { setFile(e.target.files?.[0] ?? null); setError(""); setResult(null); }} />
          <p className="helper">Cabeçalhos esperados: NR_SECAO, QT_VOTOS e NM_VOTAVEL ou NR_VOTAVEL. Pode usar vírgula ou ponto e vírgula.</p>
          <button className="primary" onClick={importFile} disabled={!file || loading}>{loading ? "Processando…" : "Processar e conferir CSV"}</button>
          {error && <p className="error" role="alert">{error}</p>}
        </div>
        {!result && <div className="empty-state"><div className="empty-symbol">↳</div><h3>Aguardando dados importados</h3><p>Não há números de votação pré-preenchidos. Isso evita que dados demonstrativos sejam confundidos com resultados reais.</p></div>}
        {result && <>
          <div className="result-meta"><div><span>Arquivo</span><strong>{result.sourceFile}</strong></div><div><span>Linhas válidas processadas</span><strong>{fmt(result.rowsRead)}</strong></div><div><span>Seções identificadas</span><strong>{fmt(result.sections)}</strong></div><div><span>Importado em</span><strong>{new Date(result.importedAt).toLocaleString("pt-BR")}</strong></div></div>
          <div className="stats">
            <article className="stat"><span>Votos atribuídos a nomes com “Lula”</span><strong>{lula === null ? "—" : fmt(lula)}</strong><small>{lula === null ? "Não encontrado no arquivo" : "Soma dos rótulos correspondentes"}</small></article>
            <article className="stat"><span>Votos atribuídos a nomes com “Flávio”</span><strong>{flavio === null ? "—" : fmt(flavio)}</strong><small>{flavio === null ? "Não encontrado no arquivo" : "Soma dos rótulos correspondentes"}</small></article>
            <article className="stat"><span>Votos em branco</span><strong>{fmt(result.blankVotes)}</strong><small>Rótulos identificados como branco</small></article>
            <article className="stat"><span>Votos nulos</span><strong>{fmt(result.nullVotes)}</strong><small>Rótulos identificados como nulo</small></article>
          </div>
          <div className="result-meta coverage-meta"><div><span>Abstenções</span><strong>Não calculadas</strong><p>Exigem dados de comparecimento/eleitorado</p></div><div><span>Seções sem dados</span><strong>Não calculadas</strong><p>Exigem lista de seções esperadas</p></div></div>
          <div className="section-heading results-heading"><div><p className="eyebrow">TOTALIZAÇÃO RECALCULADA</p><h2>Votos por rótulo no arquivo</h2></div><span className="pill">{result.candidates.length} RÓTULOS</span></div>
          <input className="search-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Filtrar por nome ou código…" aria-label="Filtrar candidatos" />
          <div className="table-wrap"><table><thead><tr><th>Nome / código conforme arquivo</th><th>Votos somados</th></tr></thead><tbody>{filtered.map((c, i) => <tr key={c.name + i}><td>{c.name}</td><td>{fmt(c.votes)}</td></tr>)}</tbody></table></div>
          <div className="audit-hash"><span>SHA-256 do conteúdo processado</span><code>{result.sha256}</code><button className="copy" onClick={() => navigator.clipboard.writeText(result.sha256)}>Copiar hash</button></div>
          <div className="warnings"><h3>Alertas e limitações ({result.warnings.length})</h3><ul>{result.warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>{result.duplicateKeys.length > 0 && <p><strong>Chaves repetidas:</strong> {result.duplicateKeys.slice(0, 20).join(", ")}{result.duplicateKeys.length > 20 ? "…" : ""}</p>}</div>
          <p className="footnote">A contagem é uma soma mecânica dos valores reconhecidos. Linhas inválidas são reportadas e ficam fora da soma automática; duplicatas válidas permanecem incluídas e são sinalizadas, sem exclusão silenciosa. Abstenções não podem ser inferidas de um CSV de votos por candidato. Nenhuma pontuação de IA é usada para modificar os totais.</p>
        </>}
      </section>}

      {tab === "metodo" && <section className="content">
        <p className="eyebrow">PROCESSO IMPLEMENTADO</p><h2>Do CSV ao total calculado</h2>
        <ol className="steps">
          <li><b>01</b><div><strong>Receber e validar o arquivo</strong><p>O endpoint aceita CSV de até 25 MB, reconhece delimitador e cabeçalhos básicos e sinaliza linhas incompatíveis.</p></div></li>
          <li><b>02</b><div><strong>Calcular o hash SHA-256</strong><p>O hash identifica o conteúdo processado e permite comparar cópias idênticas. Ele não prova quem publicou o arquivo nem que seu conteúdo original é verdadeiro.</p></div></li>
          <li><b>03</b><div><strong>Somar com regra determinística</strong><p>Os votos são somados por rótulo/código e por seção identificada. O mesmo arquivo e a mesma versão do código devem produzir os mesmos totais.</p></div></li>
          <li><b>04</b><div><strong>Expor alertas sem alterar votos</strong><p>Campos inválidos e chaves repetidas são reportados. O sistema não apaga duplicatas silenciosamente nem transforma anomalia em prova de fraude.</p></div></li>
        </ol>
        <p className="footnote">Esta versão não usa machine learning. Para evitar viés, o núcleo da contagem é determinístico; um modelo futuro poderá priorizar registros para revisão, nunca editar os números calculados.</p>
      </section>}

      {tab === "auditoria" && <section className="content">
        <p className="eyebrow">RASTREABILIDADE</p><h2>O que a auditoria registra</h2>
        <div className="audit-grid"><div><span>Proveniência</span><strong>Nome do arquivo + SHA-256</strong><p>Registrados no resultado da importação atual</p></div><div><span>Horário</span><strong>Data/hora da requisição</strong><p>Exibida como horário de processamento</p></div><div><span>Persistência</span><strong>Não configurada</strong><p>O servidor não guarda lotes nem histórico entre acessos</p></div></div>
        <div className="empty-state compact"><h3>Limite importante</h3><p>Para uma trilha pública permanente ainda faltam armazenamento imutável, logs versionados, importação automática de fonte validada e comparação com dados oficiais independentes. Não afirmamos que essas etapas já existem.</p></div>
      </section>}

      <section className="principles"><div><p className="eyebrow">COMPROMISSOS DO PROJETO</p><h2>Transparência não é um slogan.<br />É um método verificável.</h2></div><ul><li><span>✓</span> Não fabricar nem estimar votos ausentes</li><li><span>✓</span> Não apagar votos por suspeita algorítmica</li><li><span>✓</span> Exibir origem, hash e limitações</li><li><span>✓</span> Separar alerta de conclusão sobre fraude</li></ul></section>
      <footer><span>SEU_DIREITO · CONFERÊNCIA ELEITORAL</span><span>v0.2 · Importação CSV experimental · Sem atualização ao vivo</span></footer>
    </main>
  );
}
