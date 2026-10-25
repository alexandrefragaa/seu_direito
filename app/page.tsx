"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Candidate = { name: string; ballotName: string; party: string; number: string; votes: number; percent: number; photo: string | null; situation: string };
type LiveData = { source: string; updatedAt: string; scopeName: string; electionName: string; election: string; turn: number; cargo: string; candidates: Candidate[]; stats: { countedSections: number; totalSections: number; countedPercent: number; voters: number; validVotes: number; blankVotes: number; nullVotes: number; abstentions: number; electorate: number; generation: string; finalized: boolean }; raw: unknown };
type Place = { name: string; code: string; uf: string };
const cargos = [{ value: "0001", label: "Presidente" }, { value: "0003", label: "Governador" }, { value: "0005", label: "Senador" }, { value: "0006", label: "Deputado federal" }, { value: "0007", label: "Deputado estadual" }, { value: "0008", label: "Deputado distrital" }];
const ufs = [["ac","Acre"],["al","Alagoas"],["ap","Amapá"],["am","Amazonas"],["ba","Bahia"],["ce","Ceará"],["df","Distrito Federal"],["es","Espírito Santo"],["go","Goiás"],["ma","Maranhão"],["mt","Mato Grosso"],["ms","Mato Grosso do Sul"],["mg","Minas Gerais"],["pa","Pará"],["pb","Paraíba"],["pr","Paraná"],["pe","Pernambuco"],["pi","Piauí"],["rj","Rio de Janeiro"],["rn","Rio Grande do Norte"],["rs","Rio Grande do Sul"],["ro","Rondônia"],["rr","Roraima"],["sc","Santa Catarina"],["sp","São Paulo"],["se","Sergipe"],["to","Tocantins"]];
const fmt = (n: number) => new Intl.NumberFormat("pt-BR").format(n || 0);
const pct = (n: number) => `${(Number.isFinite(n) ? n : 0).toLocaleString("pt-BR", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}%`;

export default function Home() {
  const [scope, setScope] = useState("br");
  const [uf, setUf] = useState("sp");
  const [municipio, setMunicipio] = useState("");
  const [cargo, setCargo] = useState("0001");
  const [turn, setTurn] = useState("2");
  const [election, setElection] = useState("6258");
  const [places, setPlaces] = useState<Place[]>([]);
  const [placeSearch, setPlaceSearch] = useState("");
  const [data, setData] = useState<LiveData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastChecked, setLastChecked] = useState("");
  const [auto, setAuto] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const selectedUfName = ufs.find(([code]) => code === uf)?.[1] ?? uf.toUpperCase();
  const scopeLabel = scope === "br" ? "Brasil" : scope === "zz" ? "Exterior" : scope === "uf" ? selectedUfName : places.find(p => p.code === municipio)?.name ?? "Município";

  useEffect(() => {
    if (scope !== "mu") return;
    const controller = new AbortController();
    fetch(`/api/locations?election=${election}&uf=${uf}`, { signal: controller.signal, cache: "no-store" })
      .then(r => r.ok ? r.json() : Promise.reject(new Error("Não foi possível carregar a lista de municípios.")))
      .then(d => setPlaces(Array.isArray(d.places) ? d.places : []))
      .catch(e => { if (e.name !== "AbortError") setPlaces([]); });
    return () => controller.abort();
  }, [scope, uf, election]);

  const refresh = useCallback(async () => {
    setLoading(true); setError("");
    const params = new URLSearchParams({ scope, uf, cargo, election, turn });
    if (scope === "mu") params.set("municipio", municipio);
    try {
      const response = await fetch(`/api/live?${params.toString()}`, { cache: "no-store" });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Não foi possível obter os resultados oficiais.");
      setData(json as LiveData);
      setLastChecked(new Date().toISOString());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao consultar o TSE.");
    } finally { setLoading(false); }
  }, [scope, uf, municipio, cargo, election, turn]);

  useEffect(() => { refresh(); }, [refresh, refreshKey]);
  useEffect(() => {
    if (!auto) return;
    const timer = window.setInterval(() => setRefreshKey(k => k + 1), 60000);
    return () => window.clearInterval(timer);
  }, [auto]);

  const filteredPlaces = useMemo(() => {
    const q = placeSearch.trim().toLocaleLowerCase("pt-BR");
    return places.filter(p => !q || p.name.toLocaleLowerCase("pt-BR").includes(q)).slice(0, 150);
  }, [places, placeSearch]);

  const selectedCargo = cargos.find(c => c.value === cargo)?.label ?? "Cargo";
  const isPresidential = cargo === "0001";
  const resultCandidates = data?.candidates ?? [];

  return <main className="live-shell">
    <header className="live-topbar">
      <a className="live-brand" href="/" aria-label="Seu Direito início"><span className="live-mark">S<span>.</span></span><span>seu direito<small>OBSERVATÓRIO DE DADOS ELEITORAIS</small></span></a>
      <div className="live-status"><span className={data ? "live-dot" : "live-dot muted-dot"} />{data ? "DADOS DO TSE" : "CONECTANDO AO TSE"}</div>
    </header>

    <section className="live-hero">
      <div className="hero-copy"><p className="live-eyebrow">PAINEL INDEPENDENTE · FONTE OFICIAL</p><h1>Apuração <em>ao vivo.</em></h1><p>Acompanhe votos, percentuais, seções apuradas e comparecimento. Explore o Brasil, estados, municípios e o exterior em um só painel.</p></div>
      <div className="hero-live-card"><div className="hero-live-head"><span className={data ? "live-dot" : "live-dot muted-dot"} /> <strong>{data?.stats.finalized ? "TOTALIZAÇÃO FINALIZADA" : "MODO AO VIVO"}</strong></div><span className="hero-big">{data ? pct(data.stats.countedPercent) : "—"}</span><span className="hero-label">das seções totalizadas</span><div className="hero-progress"><i style={{ width: `${Math.min(100, Math.max(0, data?.stats.countedPercent ?? 0))}%` }} /></div><small>{data ? `${fmt(data.stats.countedSections)} de ${fmt(data.stats.totalSections)} seções` : "Aguardando resposta da fonte oficial"}</small></div>
    </section>

    <section className="control-panel">
      <div className="panel-title"><div><span className="live-eyebrow">EXPLORE OS RESULTADOS</span><h2>Escolha onde acompanhar</h2></div><label className="auto-toggle"><input type="checkbox" checked={auto} onChange={e => setAuto(e.target.checked)} /><span className="toggle-ui" /> Atualização automática</label></div>
      <div className="filters">
        <label>Localidade<select value={scope} onChange={e => { setScope(e.target.value); setMunicipio(""); setPlaceSearch(""); }}><option value="br">Brasil inteiro</option><option value="uf">Estado</option><option value="mu">Cidade / município</option><option value="zz">Exterior</option></select></label>
        {(scope === "uf" || scope === "mu") && <label>Estado<select value={uf} onChange={e => { setUf(e.target.value); setMunicipio(""); }} >{ufs.map(([code, name]) => <option value={code} key={code}>{name}</option>)}</select></label>}
        {scope === "mu" && <label className="city-field">Buscar cidade<select value={municipio} onChange={e => setMunicipio(e.target.value)}><option value="">Selecione um município</option>{filteredPlaces.map(p => <option value={p.code} key={p.code}>{p.name}</option>)}</select><input value={placeSearch} onChange={e => setPlaceSearch(e.target.value)} placeholder="Filtrar municípios…" /></label>}
        <label>Cargo<select value={cargo} onChange={e => setCargo(e.target.value)}>{cargos.filter(c => !(scope === "br" || scope === "zz") || c.value === "0001").map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></label>
        <label>Turno<select value={turn} onChange={e => { setTurn(e.target.value); setElection(e.target.value === "1" ? "6257" : "6258"); }}><option value="1">1º turno</option><option value="2">2º turno</option></select></label>
        <button className="refresh-button" onClick={() => setRefreshKey(k => k + 1)} disabled={loading || (scope === "mu" && !municipio)}>{loading ? "Consultando…" : "↻ Atualizar agora"}</button>
      </div>
      <div className="source-line"><span>Fonte: Tribunal Superior Eleitoral (TSE)</span><span>Atualização automática: {auto ? "a cada 60 segundos" : "desativada"}</span>{lastChecked && <span>Última consulta: {new Date(lastChecked).toLocaleTimeString("pt-BR")}</span>}</div>
    </section>

    {error && <section className="error-panel"><strong>Não foi possível carregar essa apuração.</strong><p>{error}</p><p>O TSE pode ainda não ter publicado o arquivo para essa eleição, cargo ou localidade. Não exibimos números fictícios como se fossem reais.</p><button className="refresh-button" onClick={() => setRefreshKey(k => k + 1)}>Tentar novamente</button></section>}

    <section className="results-heading"><div><span className="live-eyebrow">RESULTADO OFICIAL DISPONÍVEL</span><h2>{scopeLabel} <span>/</span> {selectedCargo}</h2><p>{data ? `Turno ${data.turn} · arquivo atualizado em ${data.stats.generation || data.updatedAt}` : `Turno ${turn} · aguardando dados`}</p></div><a href="https://resultados.tse.jus.br/" target="_blank" rel="noreferrer">Abrir portal oficial ↗</a></section>

    <section className="summary-grid">
      <article className="summary-card main-summary"><span>Seções totalizadas</span><strong>{data ? pct(data.stats.countedPercent) : "—"}</strong><div className="summary-bar"><i style={{ width: `${Math.min(100, Math.max(0, data?.stats.countedPercent ?? 0))}%` }} /></div><small>{data ? `${fmt(data.stats.countedSections)} / ${fmt(data.stats.totalSections)} seções` : "Sem dado disponível"}</small></article>
      <article className="summary-card"><span>Votos válidos</span><strong>{data ? fmt(data.stats.validVotes) : "—"}</strong><small>Votação válida divulgada</small></article>
      <article className="summary-card"><span>Votos em branco</span><strong>{data ? fmt(data.stats.blankVotes) : "—"}</strong><small>Separados dos votos nulos</small></article>
      <article className="summary-card"><span>Votos nulos</span><strong>{data ? fmt(data.stats.nullVotes) : "—"}</strong><small>Total divulgado pelo TSE</small></article>
      <article className="summary-card"><span>Comparecimento</span><strong>{data ? fmt(data.stats.voters) : "—"}</strong><small>{data ? `Abstenções: ${fmt(data.stats.abstentions)}` : "Sem dado disponível"}</small></article>
    </section>

    <section className="candidate-section">
      <div className="candidate-title"><div><span className="live-eyebrow">CLASSIFICAÇÃO DA APURAÇÃO</span><h2>Votos por candidato</h2></div><span className="candidate-count">{data ? `${resultCandidates.length} candidatos` : "Aguardando dados"}</span></div>
      {!data && !error && <div className="loading-state"><span className="spinner" />Consultando os arquivos oficiais do TSE…</div>}
      {data && resultCandidates.length === 0 && <div className="empty-live">O arquivo oficial foi recebido, mas não contém candidatos divulgáveis para esta seleção.</div>}
      <div className="candidate-list">{resultCandidates.map((c, i) => <article className="candidate-row" key={c.number + c.name}><div className="rank">{String(i + 1).padStart(2, "0")}</div>{c.photo ? <img className="candidate-photo" src={c.photo} alt={`Foto de ${c.name}`} onError={e => { e.currentTarget.style.visibility = "hidden"; }} /> : <div className="candidate-photo photo-placeholder">{c.name.slice(0,1)}</div>}<div className="candidate-info"><div className="candidate-name-line"><h3>{c.ballotName || c.name}</h3><span className="candidate-number">Nº {c.number || "—"}</span></div><p>{c.name}{c.party ? ` · ${c.party}` : ""}{c.situation ? ` · ${c.situation}` : ""}</p><div className="candidate-bar"><i style={{ width: `${Math.min(100, Math.max(0, c.percent))}%` }} /></div></div><div className="candidate-votes"><strong>{fmt(c.votes)}</strong><span>{pct(c.percent)}</span></div></article>)}</div>
    </section>

    <section className="live-footer-grid"><div><span className="live-eyebrow">RASTREABILIDADE</span><h2>Os números vêm da fonte oficial.</h2><p>O painel consulta os arquivos públicos de divulgação do TSE. A porcentagem de apuração representa seções totalizadas, não porcentagem de votos contados. Os dados dependem da publicação oficial e podem atrasar.</p><a href="https://www.tse.jus.br/eleicoes/informacoes-tecnicas-sobre-a-divulgacao-de-resultados" target="_blank" rel="noreferrer">Documentação técnica do TSE ↗</a></div><div className="integrity-card"><strong>Fonte consultada</strong><span>{data?.source ?? "https://resultados.tse.jus.br"}</span><strong>Última resposta</strong><span>{data ? new Date(data.updatedAt).toLocaleString("pt-BR") : "Ainda sem resposta válida"}</span><strong>Modo de atualização</strong><span>{auto ? "Consulta automática a cada 60 segundos" : "Atualização manual"}</span></div></section>
    <footer className="live-bottom"><span>SEU DIREITO · PAINEL DE APURAÇÃO</span><span>Dados oficiais · sem votos demonstrativos</span></footer>
  </main>;
}
