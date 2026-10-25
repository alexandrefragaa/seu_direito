# Seu_direito — conferência eleitoral independente

O **Seu_direito** é um projeto para recalcular e conferir dados eleitorais com código próprio, mostrar a origem do arquivo e tornar limitações e divergências visíveis.

## Estado atual

A versão publicada implementa uma **importação experimental de CSV** de votação por seção e um catálogo de links diretos dos arquivos de votação por seção para as 27 UFs, além de cinco conjuntos nacionais. Ela aceita arquivos de até 25 MB e espera colunas equivalentes a `NR_SECAO`, `QT_VOTOS` e `NM_VOTAVEL` ou `NR_VOTAVEL`. Reconhece delimitador por vírgula ou ponto e vírgula, soma valores por rótulo/código e mostra SHA-256 do conteúdo processado, linhas válidas, seções identificadas e alertas estruturais.

**Ainda não é um sistema eleitoral ao vivo.** Não existe agendamento de atualização, ingestão automática do TSE, armazenamento permanente dos lotes, comparação automatizada com a totalização oficial, nem resultados reais pré-carregados. Não use esta ferramenta isoladamente para declarar resultados eleitorais ou fraude.

## Catálogo de fontes por UF

A aba **Fontes do TSE** lista os links diretos `votacao_secao_2026_UF.zip` para AC, AL, AP, AM, BA, CE, DF, ES, GO, MA, MT, MS, MG, PA, PB, PR, PE, PI, RJ, RN, RS, RO, RR, SC, SP, SE e TO. Também reúne links dos conjuntos nacionais por candidato, partido, município-zona e seção.

O catálogo apenas organiza links públicos. Ele **não baixa, valida ou processa automaticamente os ZIPs**; confirme disponibilidade, esquema e data de atualização no portal oficial antes de interpretar os dados. Não some arquivos de granularidades diferentes como se fossem conjuntos independentes.

## Princípios

- **Sem números inventados:** não há totais de demonstração exibidos como se fossem votos reais.
- **Soma determinística:** o motor não usa IA para alterar votos ou decidir o que deve ser contado.
- **Alertas sem apagamento silencioso:** chaves duplicadas são sinalizadas e mantidas na soma; linhas estruturalmente inválidas são reportadas e não entram no cálculo automático.
- **Integridade verificável:** o hash SHA-256 identifica o conteúdo recebido, mas não comprova a autenticidade do emissor ou a veracidade do arquivo.
- **Cobertura explícita:** linhas válidas e seções distintas encontradas são mostradas; isso não garante que todas as seções do país estejam presentes.
- **Neutralidade:** uma anomalia é um motivo para revisão, não uma prova de fraude.

## Importação

1. Baixe um CSV oficial de votação por seção a partir do [Portal de Dados Abertos do TSE](https://dadosabertos.tse.jus.br/dataset/resultados-2026).
2. Confirme que o arquivo é a tabela de votação por seção e que os cabeçalhos correspondem ao formato esperado.
3. Na página, selecione o arquivo e clique em **Processar e conferir CSV**.
4. Compare os totais com a documentação e com a publicação oficial da mesma eleição/turno/cargo.

Os cabeçalhos podem variar conforme arquivo e eleição. Se o formato não for reconhecido, a ferramenta mostra um erro em vez de inventar um resultado.

## Categorias importantes

- **Votos em branco e nulos** são mostrados separadamente se o arquivo contiver rótulos reconhecíveis.
- **Abstenção** não é voto e não pode ser deduzida de um arquivo de votos por candidato; precisa de uma fonte de comparecimento/eleitorado compatível.
- **Seção sem dados** não significa zero votos. É preciso uma lista de seções esperadas para calcular cobertura e pendências.
- **Lula e Flávio** só aparecem com total específico se os rótulos correspondentes existirem no CSV importado. O sistema não assume candidaturas nem preenche valores ausentes.

## Limitações de auditoria

O endpoint calcula o hash do texto normalizado de quebras de linha recebido pelo processador. Não armazena o arquivo bruto permanentemente nem mantém uma trilha pública imutável entre requisições. O projeto ainda precisa de testes automatizados abrangentes, adaptadores específicos por eleição/formato, validação do dicionário oficial de votos, lista de seções esperadas, armazenamento de lotes e comparação de totais.

O cálculo próprio é independente; a fonte pode continuar sendo oficial. Para independência de proveniência seria necessário comparar com cópias independentes dos Boletins de Urna, não apenas com outra exportação derivada do mesmo sistema.

## Arquitetura planejada

1. Adaptadores versionados por arquivo/eleição do TSE.
2. Preservação de arquivos originais, metadados de origem e hashes.
3. Validação de esquema, identificadores, duplicatas e consistência.
4. Soma determinística e testes reproduzíveis.
5. Comparação com totais oficiais e registro de divergências.
6. Monitoramento de novas publicações somente quando houver fonte acessível e validada.
7. Detecção estatística/ML apenas para priorizar revisão humana; nunca para editar votos ou concluir fraude automaticamente.

## Desenvolvimento

Requer Node.js 20+.

```bash
npm install
npm run dev
npm run build
```

API: `POST /api/audit` com multipart form-data e campo `file` (CSV; máximo 25 MB).
