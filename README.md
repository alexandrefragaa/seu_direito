# Seu Direito — painel eleitoral ao vivo

A página inicial apresenta um painel para acompanhar resultados oficiais do TSE, com fotos de candidatos, votos, percentuais, seções totalizadas, comparecimento, brancos, nulos e navegação por Brasil, estado, município e exterior.

## Integração ao vivo

- `GET /api/live`: consulta um arquivo JSON de resultado unificado (EA20) do TSE e normaliza candidatos e indicadores.
- `GET /api/locations`: consulta a configuração pública de municípios para preencher a seleção de cidades.
- A interface consulta automaticamente a cada 60 segundos por padrão; também permite atualização manual.
- A fonte é `https://resultados.tse.jus.br`; os dados só são exibidos quando o arquivo oficial é recebido. Erros/arquivos ainda não publicados são mostrados, não substituídos por dados fictícios.
- O TSE separa eleições federais e estaduais e disponibiliza arquivos por abrangência. O painel escolhe o arquivo conforme turno e cargo.

## Limitações importantes

A integração depende de os caminhos e arquivos oficiais permanecerem disponíveis e de o TSE publicar resultados para a eleição, turno, cargo e localidade selecionados. O painel não garante que a apuração esteja em andamento em todos os momentos. Fotos são carregadas da pasta pública de fotos do TSE a partir do identificador de candidato no arquivo EA20.

O projeto ainda não implementa verificação criptográfica JWS dos arquivos recebidos. A origem exibida é a URL consultada; não equivale a uma auditoria criptográfica independente. Percentual de seções totalizadas é diferente de percentual de votos apurados. Cargos nacionais (Presidente) podem ser consultados no Brasil/exterior; cargos estaduais dependem da UF e dos resultados publicados.

## Documentação oficial

- [Informações técnicas sobre a divulgação de resultados — TSE](https://www.tse.jus.br/eleicoes/informacoes-tecnicas-sobre-a-divulgacao-de-resultados)
- [Instruções para download dos arquivos de divulgação 2026 — TSE](https://www.tse.jus.br/eleicoes/eleicoes-2026-content/arquivos/divulgacao-de-resultados/tse-instrucoes-para-download-dos-arquivos-da-divulgacao-2026)
- [EA20 — arquivo de resultado unificado](https://www.tse.jus.br/eleicoes/eleicoes-2026-content/arquivos/divulgacao-de-resultados/tse-ea20-arquivo-de-resultado-unificado)

## Desenvolvimento

Requer Node.js 20+.

```bash
npm install
npm run dev
npm run build
```

A importação CSV anterior permanece disponível em `POST /api/audit`, como ferramenta complementar de conferência.
