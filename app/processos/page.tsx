"use client";

import "./processos.css";

import { FormEvent, useState } from "react";

type ProcessResult = {
  found?: boolean;
  source?: string;
  message?: string;
  error?: string;
  fetchedAt?: string;
  process?: {
    number: string;
    tribunal?: string | null;
    degree?: string | null;
    class?: string | null;
    classCode?: number | null;
    subjects?: string[];
    court?: string | null;
    filingDate?: string | null;
    lastUpdate?: string | null;
    system?: string | null;
    movements?: { date?: string | null; name: string; code?: number | null }[];
  };
};

const mask = (value: string) => value.replace(/\\D/g, "").slice(0, 20).replace(/(\\d{7})(\\d)/, "$1-$2").replace(/(\\d{2})(\\d)/, "$1.$2").replace(/(\\d{4})(\\d)/, "$1.$2").replace(/(\\d)(\\d{2})$/, "$1.$2");

export default function ProcessosPage() {
  const [number, setNumber] = useState("");
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function search(event: FormEvent) {
    event.preventDefault();
    const digits = number.replace(/\\D/g, "");
    if (digits.length !== 20) {
      setResult({ error: "Digite o número CNJ completo, com 20 dígitos." });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch(`/api/datajud?numero=${digits}`, { cache: "no-store" });
      const data = await response.json();
      setResult(data);
    } catch {
      setResult({ error: "Falha de conexão ao consultar o DataJud." });
    } finally {
      setLoading(false);
    }
  }

  const date = (value?: string | null) => {
    if (!value) return "Não informado";
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString("pt-BR");
  };

  return <main className="process-shell">
    <header className="process-header">
      <a className="process-brand" href="/">SEU DIREITO <span>· DADOS PÚBLICOS</span></a>
      <a className="process-back" href="/">← Voltar ao painel eleitoral</a>
    </header>
    <section className="process-intro">
      <span className="process-kicker">CONSULTA PROCESSUAL</span>
      <h1>Pesquisa no DataJud</h1>
      <p>Consulte metadados e movimentações de processos públicos disponibilizados pelo Conselho Nacional de Justiça.</p>
    </section>
    <form className="process-search" onSubmit={search}>
      <label htmlFor="process-number">Número do processo (padrão CNJ)</label>
      <div className="process-search-row">
        <input id="process-number" value={number} onChange={e => setNumber(mask(e.target.value))} placeholder="0000000-00.0000.0.00.0000" inputMode="numeric" autoComplete="off" />
        <button type="submit" disabled={loading}>{loading ? "Consultando…" : "Consultar processo"}</button>
      </div>
      <small>Informe os 20 dígitos do número CNJ. A consulta retorna somente os dados disponibilizados publicamente pela API.</small>
    </form>

    {result?.error && <section className="process-message process-error">{result.error}</section>}
    {result && !result.error && result.found === false && <section className="process-message">{result.message}</section>}
    {result?.found && result.process && <section className="process-result">
      <div className="process-result-top"><div><span className="process-kicker">REGISTRO LOCALIZADO</span><h2>{result.process.number}</h2></div><span className="process-source">{result.source}</span></div>
      <div className="process-facts">
        <article><span>Tribunal</span><strong>{result.process.tribunal || "Não informado"}</strong></article>
        <article><span>Grau</span><strong>{result.process.degree || "Não informado"}</strong></article>
        <article><span>Classe processual</span><strong>{result.process.class || "Não informado"}</strong></article>
        <article><span>Órgão julgador</span><strong>{result.process.court || "Não informado"}</strong></article>
        <article><span>Data de ajuizamento</span><strong>{date(result.process.filingDate)}</strong></article>
        <article><span>Última atualização registrada</span><strong>{date(result.process.lastUpdate)}</strong></article>
        <article><span>Sistema</span><strong>{result.process.system || "Não informado"}</strong></article>
        <article><span>Assuntos</span><strong>{result.process.subjects?.join(", ") || "Não informado"}</strong></article>
      </div>
      <div className="process-movements"><h3>Movimentações disponíveis</h3>
        {result.process.movements?.length ? <ol>{result.process.movements.map((movement, index) => <li key={index}><time>{date(movement.date)}</time><strong>{movement.name}</strong>{movement.code ? <small>Código {movement.code}</small> : null}</li>)}</ol> : <p>A API não retornou movimentações para este registro.</p>}
      </div>
      <p className="process-disclaimer">Dados provenientes do CNJ · DataJud. A disponibilidade e a atualização dependem das remessas do tribunal de origem. Esta consulta não substitui a consulta oficial do tribunal.</p>
    </section>}
    <footer className="process-footer">Fonte: <a href="https://www.cnj.jus.br/sistemas/datajud/api-publica/" target="_blank" rel="noreferrer">API Pública do DataJud · CNJ</a></footer>
  </main>;
}
