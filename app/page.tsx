"use client";

import { useState } from "react";

type Tab = "visao" | "metodo" | "auditoria";

export default function Home() {
  const [tab, setTab] = useState<Tab>("visao");

  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Seu_direito início">
          <span className="brand-mark">S<span>.</span></span>
          <span>seu_direito<small>OBSERVATÓRIO DE DADOS ELEITORAIS</small></span>
        </a>
        <span className="status"><i /> PROJETO EM CONSTRUÇÃO</span>
      </header>

      <section className="intro">
        <p className="eyebrow">CONFERÊNCIA PÚBLICA · MÉTODO ABERTO</p>
        <h1>Os números precisam<br /><em>poder ser conferidos.</em></h1>
        <p className="lead">
          Uma iniciativa para reprocessar registros eleitorais por seção, publicar como cada total foi calculado
          e deixar visíveis as fontes, a cobertura e qualquer divergência encontrada.
        </p>
        <div className="notice">
          <span className="notice-icon">i</span>
          <p><strong>Esta versão ainda não exibe resultados eleitorais.</strong> A ingestão e a validação das fontes estão em desenvolvimento. Não confunda a interface com uma apuração em funcionamento.</p>
        </div>
      </section>

      <nav className="tabs" aria-label="Seções do painel">
        <button className={tab === "visao" ? "active" : ""} onClick={() => setTab("visao")}>Visão geral</button>
        <button className={tab === "metodo" ? "active" : ""} onClick={() => setTab("metodo")}>Como calculamos</button>
        <button className={tab === "auditoria" ? "active" : ""} onClick={() => setTab("auditoria")}>Trilha de auditoria</button>
      </nav>

      {tab === "visao" && (
        <section className="content">
          <div className="section-heading">
            <div><p className="eyebrow">PAINEL DE CONFERÊNCIA</p><h2>Estado dos dados</h2></div>
            <span className="pill muted">SEM DADOS IMPORTADOS</span>
          </div>
          <div className="stats">
            <article className="stat"><span>Boletins recebidos</span><strong>—</strong><small>Aguardando fonte validada</small></article>
            <article className="stat"><span>Seções processadas</span><strong>—</strong><small>Sem processamento iniciado</small></article>
            <article className="stat"><span>Votos recalculados</span><strong>—</strong><small>Nenhum total publicado</small></article>
            <article className="stat"><span>Divergências confirmadas</span><strong>—</strong><small>Não avaliadas</small></article>
          </div>
          <div className="empty-state">
            <div className="empty-symbol">↳</div>
            <h3>Aguardando dados primários verificáveis</h3>
            <p>O painel só será preenchido depois que os arquivos forem importados, validados e processados. Cada lote terá origem, horário de coleta e hash de integridade.</p>
          </div>
        </section>
      )}

      {tab === "metodo" && (
        <section className="content">
          <p className="eyebrow">PROCESSO PREVISTO</p><h2>Do registro ao total publicado</h2>
          <ol className="steps">
            <li><b>01</b><div><strong>Preservar a fonte original</strong><p>Guardar o arquivo bruto sem alterações, registrar a origem, a data de coleta e o hash SHA-256.</p></div></li>
            <li><b>02</b><div><strong>Validar cada registro</strong><p>Conferir formato, identificadores de seção, campos obrigatórios, duplicatas e integridade do arquivo.</p></div></li>
            <li><b>03</b><div><strong>Recalcular com código próprio</strong><p>Somar os votos por seção e agregar município, estado e cargo. O algoritmo e os testes serão públicos.</p></div></li>
            <li><b>04</b><div><strong>Comparar e expor diferenças</strong><p>Separar diferenças explicadas, registros pendentes e divergências ainda não resolvidas. Não inferir fraude automaticamente.</p></div></li>
          </ol>
          <p className="footnote">Importante: recalcular de forma independente não torna a fonte original independente. A origem de cada conjunto será declarada.</p>
        </section>
      )}

      {tab === "auditoria" && (
        <section className="content">
          <p className="eyebrow">RASTREABILIDADE</p><h2>Registro de auditoria</h2>
          <div className="audit-grid">
            <div><span>Última coleta</span><strong>—</strong><p>Nenhuma coleta executada</p></div>
            <div><span>Hash do lote</span><strong>—</strong><p>Ainda não existe lote importado</p></div>
            <div><span>Versão do cálculo</span><strong>v0.1 · interface</strong><p>Motor de apuração ainda não implementado</p></div>
          </div>
          <div className="empty-state compact"><h3>Auditoria ainda não iniciada</h3><p>Quando a ingestão estiver pronta, este espaço mostrará lotes, hashes, validações, erros e alterações de processamento.</p></div>
        </section>
      )}

      <section className="principles">
        <div><p className="eyebrow">COMPROMISSOS DO PROJETO</p><h2>Transparência não é um slogan.<br />É um método verificável.</h2></div>
        <ul>
          <li><span>✓</span> Não fabricar nem estimar votos ausentes</li>
          <li><span>✓</span> Exibir fonte e horário real dos dados</li>
          <li><span>✓</span> Publicar código, critérios e limitações</li>
          <li><span>✓</span> Registrar lacunas e divergências sem ocultá-las</li>
        </ul>
      </section>

      <footer>
        <span>SEU_DIREITO · CONFERÊNCIA ELEITORAL</span>
        <span>Versão inicial 0.1 · Sem resultados ativos</span>
      </footer>
    </main>
  );
}
