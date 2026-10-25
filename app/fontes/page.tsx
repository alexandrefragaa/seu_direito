"use client";

import Link from "next/link";
import "./fontes.css";

const base = "https://sig.tse.jus.br/ords/dwapr/r/seai";

const groups = [
  {
    title: "Resultados e participação",
    description: "Painéis estatísticos para consultar resultados eleitorais, votação nominal e participação do eleitorado.",
    links: [
      { label: "Painéis de resultados", href: `${base}/sig-eleicao-resultados/pain%C3%A9is-de-resultados` },
      { label: "Votação nominal", href: `${base}/sig-eleicao-resultados/resultado-da-elei%C3%A7%C3%A3o` },
      { label: "Comparecimento e abstenção", href: `${base}/sig-eleicao-comp-abst/modulo-comparecimento-abstencao` },
      { label: "Estatísticas de eleição", href: `${base}/sig-eleicao/estatisticas-eleicao` },
    ],
  },
  {
    title: "Candidaturas e eleitorado",
    description: "Informações sobre candidaturas, perfil do eleitorado, filiação partidária e funções eleitorais.",
    links: [
      { label: "Painéis de candidaturas", href: `${base}/sig-candidaturas/pain%C3%A9is-de-candidaturas` },
      { label: "Eleitorado da eleição", href: `${base}/sig-eleicao-eleitorado/eleitorado-eleicao` },
      { label: "Eleitorado mensal", href: `${base}/sig-eleitor-eleitorado-mensal/eleitorado-mensal` },
      { label: "Filiação partidária", href: `${base}/sig-eleicao-filiados/m%C3%B3dulo-de-filia%C3%A7%C3%A3o1` },
      { label: "Mesárias, mesários e funções especiais", href: `${base}/sig-eleicao-mesarios/pain%C3%A9is-de-mes%C3%A1rios` },
    ],
  },
  {
    title: "Processos e fiscalização eleitoral",
    description: "Painéis do TSE relacionados a processos eleitorais, denúncias e justificativas.",
    links: [
      { label: "Processos eleitorais", href: `${base}/sig-eleicao-processual/pain%C3%A9is-de-processos-eleitorais` },
      { label: "Denúncias eleitorais", href: `${base}/sig-eleicao-denuncias/pain%C3%A9is-de-den%C3%BAncias` },
      { label: "Justificativas", href: `${base}/sig-justificativas/pain%C3%A9is-de-justificativas` },
      { label: "Faltosos nos últimos três pleitos", href: `${base}/sig-faltosos/pain%C3%A9is-de-faltosos` },
      { label: "Consulta processual do projeto (DataJud)", href: "/processos", internal: true },
    ],
  },
  {
    title: "Financiamento e pesquisas",
    description: "Consultas sobre receitas, despesas, prestação de contas e pesquisas eleitorais registradas.",
    links: [
      { label: "Prestação de contas", href: `${base}/sig-prestacao-contas/pain%C3%A9is-de-presta%C3%A7%C3%A3o-de-contas` },
      { label: "Pesquisas eleitorais", href: `${base}/sig-pesquisas-eleitorais/pain%C3%A9is-de-pesquisas-eleitorais` },
    ],
  },
  {
    title: "Bases para baixar e analisar",
    description: "Use os conjuntos de dados oficiais quando precisar trabalhar com arquivos e fazer análises próprias.",
    links: [
      { label: "Conjuntos de dados do SIG Eleição", href: `${base}/sig-eleicao-arquivo/conjuntos-de-dados1` },
      { label: "Portal de Dados Abertos do TSE", href: "https://dadosabertos.tse.jus.br/" },
      { label: "Resultados oficiais em tempo real", href: "https://resultados.tse.jus.br/" },
      { label: "Portal do Tribunal Superior Eleitoral", href: "https://www.tse.jus.br/" },
    ],
  },
];

export default function FontesEleitoraisPage() {
  return (
    <main className="sources-shell">
      <header className="sources-topbar">
        <Link className="sources-brand" href="/" aria-label="Seu Direito — início">
          <span className="sources-mark">S<span>.</span></span>
          <span>seu direito<small>OBSERVATÓRIO ELEITORAL</small></span>
        </Link>
        <Link className="sources-back" href="/">← Voltar ao painel</Link>
      </header>

      <section className="sources-intro">
        <span className="sources-eyebrow">TRANSPARÊNCIA · FONTES PRIMÁRIAS</span>
        <h1>Fontes oficiais eleitorais</h1>
        <p>Atalhos para os painéis, estatísticas e conjuntos de dados públicos listados no portal Estatísticas Eleitorais do TSE.</p>
      </section>

      <section className="sources-note" aria-label="Nota sobre as fontes">
        <strong>Como usar esta página</strong>
        <p>Os links abrem os ambientes oficiais responsáveis pelos dados. Alguns painéis podem solicitar filtros ou iniciar uma nova sessão. Os parâmetros de sessão temporários do HTML de origem foram omitidos.</p>
      </section>

      <div className="sources-grid">
        {groups.map((group) => (
          <section className="sources-card" key={group.title}>
            <h2>{group.title}</h2>
            <p>{group.description}</p>
            <ul>
              {group.links.map((link) => (
                <li key={link.label}>
                  {"internal" in link && link.internal ? (
                    <Link href={link.href}>{link.label}<span aria-hidden="true"> ↗</span></Link>
                  ) : (
                    <a href={link.href} target="_blank" rel="noreferrer">{link.label}<span aria-hidden="true"> ↗</span></a>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section className="sources-method">
        <h2>Nota de método</h2>
        <p>Esta página é um catálogo de fontes, não uma cópia dos painéis do TSE. O painel de apuração do Seu Direito consulta a fonte de resultados oficiais separadamente. Estatísticas históricas, prestação de contas, candidaturas e processos podem ter cobertura e periodicidade diferentes; confira a data e os filtros apresentados em cada fonte.</p>
      </section>

      <footer className="sources-footer">
        <span>SEU DIREITO · FONTES PÚBLICAS</span>
        <a href="https://sig.tse.jus.br/ords/dwapr/r/seai/sig-eleicao/home" target="_blank" rel="noreferrer">Abrir Estatísticas Eleitorais do TSE ↗</a>
      </footer>
    </main>
  );
}
