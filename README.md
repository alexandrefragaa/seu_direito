# Seu_direito — Apuração independente

O **Seu_direito** é um projeto de conferência eleitoral independente. O objetivo é recalcular totais a partir de registros primários por seção eleitoral, manter evidências de origem e tornar diferenças verificáveis — não apenas redesenhar um totalizador existente.

## Princípios

- **Sem números inventados:** a interface não apresenta dados demonstrativos como se fossem votos reais.
- **Fonte e horário visíveis:** cada conjunto de dados deve registrar origem, horário de coleta e data de referência.
- **Reprocessamento independente:** somar os votos por seção com código próprio e comparar resultados separadamente.
- **Integridade verificável:** guardar arquivos originais, calcular SHA-256 e registrar importações.
- **Cobertura explícita:** informar seções recebidas, pendentes, inválidas e ainda não verificadas.
- **Neutralidade:** publicar divergências documentadas sem afirmar fraude sem evidência suficiente.

## O que “independente” significa aqui

O cálculo e a trilha de auditoria serão próprios. Se a entrada inicial vier de arquivos públicos oficiais, isso será informado claramente: a soma pode ser independente, mas a origem do arquivo não é independente. Uma etapa futura poderá aceitar cópias/fotos de Boletins de Urna coletadas por observadores e compará-las com os arquivos recebidos.

## Estado atual

Este repositório contém o início do projeto e a interface-base. **Ainda não é um apurador eleitoral ao vivo** e não deve ser usado para afirmar resultados reais até que a ingestão, validação, cobertura e testes estejam implementados.

## Próximas etapas

1. Documentar e validar formatos primários de Boletim de Urna.
2. Criar importador que preserve os arquivos originais e seus hashes.
3. Implementar validação de schema, duplicatas e consistência dos registros.
4. Somar os votos por seção com código próprio e testes automatizados.
5. Expor proveniência, horário, cobertura e divergências na interface.
6. Só então conectar uma fonte atualizada e monitorar novas publicações.

## Desenvolvimento

Requer Node.js 20+.

```bash
npm install
npm run dev
```

A interface inicial usa estado vazio por padrão. Não há votos fictícios nem integração ativa com uma API eleitoral.
