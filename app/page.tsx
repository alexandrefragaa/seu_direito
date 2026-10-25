"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Candidate = { name: string; ballotName: string; party: string; number: string; votes: number; percent: number; photo: string | null; situation: string };
type LiveData = { source: string; updatedAt: string; scopeName: string; electionName: string; election: string; turn: number; cargo: string; candidates: Candidate[]; stats: { countedSections: number; totalSections: number; countedPercent: number; voters: number; validVotes: number; blankVotes: number; nullVotes: number; abstentions: number; electorate: number; generation: string; finalized: boolean } };
type Place = { name: string; code: string; uf: string };
const cargos = [{ value: "0001", label: "Presidente" }, { value: "0003", label: "Governador" }, { value: "0005", label: "Senador" }, { value: "0006", label: "Deputado federal" }, { value: "0007", label: "Deputado estadual" }, { value: "0008", label: "Deputado distrital" }];
const ufs = [["ac","Acre"],["al","Alagoas"],["ap","Amapá"],["am","Amazonas"],["ba","Bahia"],["ce","Ceará"],["df","Distrito Federal"],["es","Espírito Santo"],["go","Goiás"],["ma","Maranhão"],["mt","Mato Grosso"],["ms","Mato Grosso do Sul"],["mg","Minas Gerais"],["pa","Pará"],["pb","Paraíba"],["pr","Paraná"],["pe","Pernambuco"],["pi","Piauí"],["rj","Rio de Janeiro"],["rn","Rio Grande do Norte"],["rs","Rio Grande do Sul"],["ro","Rondônia"],["rr","Roraima"],["sc","Santa Catarina"],["sp","São Paulo"],["se","Sergipe"],["to","Tocantins"]];
const fmt = (n: number) => new Intl.NumberFormat("pt-BR").format(n || 0);
const pct = (n: number) => `${(Number.isFinite(n) ? n : 0).toLocaleString("pt-BR", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}%`;
const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

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
  const [auto, setAuto] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const selectedUfName = ufs.find(([code]) => code === uf)?.[1] ?? uf.toUpperCase();
  const scopeLabel = scope === "br" ? "Brasil" : scope === "zz" ? "Exterior" : scope === "uf" ? selectedUfName : places.find(p => p.code === municipio)?.name ?? (scope === "extmu" ? "Localidade no exterior" : "Município");

  useEffect(() => {
    if (scope !== "mu" && scope !== "extmu") return;
    const controller = new AbortController();
    fetch(`/api/locations?turn=${turn}&cargo=${cargo}&uf=${scope === "extmu" ? "zz" : uf}`, { signal: controller.signal, cache: "no-store" })
      .then(r => r.ok ? r.json() : Promise.reject(new Error("Não foi possível carregar a lista de localidades.")))
      .then(d => setPlaces(Array.isArray(d.places) ? d.places : []))
      .catch(e => { if (e.name !== "AbortError") setPlaces([]); });
    return () => controller.abort();
  }, [scope, uf, turn, cargo]);

  const refresh = useCallback(async () => {
    setLoading(true); setError("");
    const params = new URLSearchParams({ scope, uf: scope === "extmu" ? "zz" : uf, cargo, election, turn });
    if (scope === "mu" || scope === "extmu") params.set("municipio", municipio);
    try {
      const response = await fetch(`/api/live?${params.toString()}`, { cache: "no-store" });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Não foi possível obter os resultados oficiais.");
      setData(json as LiveData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao consultar o TSE.");
      setData(null);
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
  const candidates = data?.candidates ?? [];
  const featured = cargo === "0001" && scope === "br";
  const featuredCandidates = useMemo(() => {
    if (!featured) return [];
    const lula = candidates.find(c => normalize(c.name + " " + c.ballotName).includes("lula"));
    const flavio = candidates.find(c => normalize(c.name + " " + c.ballotName).includes("flavio"));
    return [lula, flavio].filter((c): c is Candidate => Boolean(c));
  }, [candidates, featured]);

  return <main className="live-shell">
    <header className="live-topbar">
      <a className="live-brand" href="/" aria-label="Seu Direito início"><span className="live-mark">S<span>.</span></span><span>seu direito<small>OBSERVATÓRIO ELEITORAL</small></span></a>
      <div className="top-controls"><label className="auto-toggle"><input type="checkbox" checked={auto} onChange={e => setAuto(e.target.checked)} /><span className="toggle-ui" /> Atualização automática</label><button className="refresh-button" onClick={() => setRefreshKey(k => k + 1)} disabled={loading || ((scope === "mu" || scope === "extmu") && !municipio)}>{loading ? "Atualizando…" : "↻ Atualizar"}</button></div>
    </header>

    <section className="notice-22"><span className="notice-icon">!</span><div><strong>Previsão de atualização: 22h</strong><p>Horário sujeito a confirmação oficial. Os números serão exibidos assim que os arquivos forem publicados pelo TSE.</p></div></section>

    <section className="filters-panel">
      <div className="filters">
        <label>Localidade<select value={scope} onChange={e => { const next = e.target.value; setScope(next); setMunicipio(""); setPlaceSearch(""); if ((next === "br" || next === "zz" || next === "extmu") && cargo !== "0001") setCargo("0001"); }}><option value="br">Brasil inteiro</option><option value="uf">Estado</option><option value="mu">Município</option><option value="zz">Exterior (total)</option><option value="extmu">Localidade no exterior</option></select></label>
        {(scope === "uf" || scope === "mu") && <label>Estado<select value={uf} onChange={e => { setUf(e.target.value); setMunicipio(""); }} >{ufs.map(([code, name]) => <option value={code} key={code}>{name}</option>)}</select></label>}
        {(scope === "mu" || scope === "extmu") && <label className="city-field">{scope === "extmu" ? "País / localidade" : "Município"}<select value={municipio} onChange={e => setMunicipio(e.target.value)}><option value="">Selecione…</option>{filteredPlaces.map(p => <option value={p.code} key={p.code}>{p.name}</option>)}</select><input value={placeSearch} onChange={e => setPlaceSearch(e.target.value)} placeholder="Filtrar lista…" /></label>}
        <label>Cargo<select value={cargo} onChange={e => { const next = e.target.value; setCargo(next); if (next !== "0001" && (scope === "br" || scope === "zz")) setScope("uf"); }} >{cargos.filter(c => !(scope === "br" || scope === "zz") || c.value === "0001").map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></label>
        <label>Turno<select value={turn} onChange={e => { const next = e.target.value; setTurn(next); setElection(cargo === "0001" ? (next === "1" ? "6257" : "6258") : (next === "1" ? "6259" : "6260")); }}><option value="1">1º turno</option><option value="2">2º turno</option></select></label>
      </div>
    </section>

    <section className="results-heading"><div><span className="live-eyebrow">{scopeLabel.toLocaleUpperCase("pt-BR")}</span><h1>{selectedCargo}</h1></div><span className="turn-label">{turn}º turno · Eleições 2026</span></section>

    {error && <section className="error-panel"><strong>Resultados ainda indisponíveis</strong><p>{error}</p><p>O painel não exibe números estimados ou inventados.</p><button className="refresh-button" onClick={() => setRefreshKey(k => k + 1)}>Tentar novamente</button></section>}

    {featured ? <section className="featured-grid">
      {(["lula", "flavio"] as const).map(key => {
        const c = featuredCandidates.find(item => normalize(item.name + " " + item.ballotName).includes(key));
        const title = key === "lula" ? "Lula" : "Flávio Bolsonaro";
        const party = key === "lula" ? "PT · 13" : "PL · 22";
        return <article className="featured-card" key={key}>
          <div className="portrait-wrap">{c?.photo ? <img src={c.photo} alt={`Foto oficial de ${title}`} className="featured-photo" onError={e => { e.currentTarget.style.display = "none"; }} /> : <div className="portrait-placeholder">{title.split(" ").map(s => s[0]).join("").slice(0,2)}</div>}</div>
          <div className="featured-details"><div className="candidate-party">{party}</div><h2>{title}</h2><div className="candidate-total">{c ? fmt(c.votes) : "—"} <span>votos</span></div><div className="candidate-percent">{c ? pct(c.percent) : "Aguardando dados oficiais"}</div><div className="featured-bar"><i style={{ width: `${Math.min(100, Math.max(0, c?.percent ?? 0))}%` }} /></div></div>
        </article>;
      })}
    </section> : <section className="candidate-section"><div className="candidate-list">{candidates.map((c, i) => <article className="candidate-row" key={c.number + c.name}><span className="rank">{i + 1}</span>{c.photo ? <img className="candidate-photo" src={c.photo} alt={`Foto de ${c.name}`} /> : <div className="candidate-photo photo-placeholder">{c.name.slice(0,1)}</div>}<div className="candidate-info"><h2>{c.ballotName || c.name}</h2><p>{c.name} · {c.party}</p><div className="candidate-bar"><i style={{ width: `${Math.min(100, Math.max(0, c.percent))}%` }} /></div></div><div className="candidate-votes"><strong>{fmt(c.votes)}</strong><span>{pct(c.percent)}</span></div></article>)}</div></section>}

    <section className="mini-stats"><article><span>Seções totalizadas</span><strong>{data ? pct(data.stats.countedPercent) : "—"}</strong><div className="candidate-bar"><i style={{ width: `${Math.min(100, Math.max(0, data?.stats.countedPercent ?? 0))}%` }} /></div><small>{data ? `${fmt(data.stats.countedSections)} de ${fmt(data.stats.totalSections)}` : "Aguardando publicação"}</small></article><article><span>Votos válidos</span><strong>{data ? fmt(data.stats.validVotes) : "—"}</strong></article><article><span>Comparecimento</span><strong>{data ? fmt(data.stats.voters) : "—"}</strong></article></section>
    <footer className="live-bottom"><span>SEU DIREITO</span><a href="https://resultados.tse.jus.br/" target="_blank" rel="noreferrer">Consultar fonte oficial do TSE ↗</a></footer>
  </main>;
}
