# LumenFlow - Dashboard Inteligente de Gestão de Energia IoT

<p align="center">
  <i>Monitoramento em tempo real, redução de desperdícios e alertas inteligentes para o setor atacadista.</i>
</p>

## 💡 Sobre o Projeto
O **LumenFlow** é um sistema de dashboard inteligente projetado para a gestão e monitoramento de energia elétrica. O propósito principal é atuar como um monitorador de uso em tempo real, integrando-se com simulações de hardware (IoT) para transformar dados técnicos brutos de consumo de sensores em indicadores visuais, painéis financeiros e alertas acionáveis. Isso permite identificar rapidamente desperdícios, consumo anômalo noturno e reduzir de forma proativa os custos operacionais da empresa.

## 🏗️ Arquitetura do Sistema
O projeto foi modelado com uma abordagem técnica escalável, dividida em três camadas principais:

1. **Frontend (Aplicação Web)**: Desenvolvido em **Vanilla JavaScript** (ES6+ Modules) e CSS nativo com um Design System flexível com tokens estruturados. Adota uma arquitetura orientada a componentes modulares (Services, Utils, Components, Pages) e um sistema de roteamento tipo *Single Page Application (SPA)* nativo, garantindo performance e isolamento do código de negócio.
2. **Backend e Persistência**: A aplicação utiliza o ecossistema do **Firebase Realtime Database (RTDB)**. Este atua com o princípio de BaaS (*Backend as a Service*), sincronizando eventos remotamente via protocolo JSON/REST com o frontend web sem depender da construção complexa de uma API tradicional para gerenciar requisições.
3. **Hardware / IoT (Camada Física Simulada)**: A injeção de dados de sensores virtuais em tempo real baseia-se em um sistema microcontrolado (simulação via plataforma **Wokwi**). O código em C++ dentro de um *ESP32 virtual* fará leituras de potenciômetros (atuando como sensores de corrente) publicando para os servidores em nuvem as métricas de potência por equipamento.

## 🚀 Funcionalidades Chave
* **Painel de Consumo em Tempo Real**: Indicadores chave de desempenho (KPIs), exibindo consumo global (kWh) e estimativas de custo financeiro (R$).
* **Sistema de Alertas e Anomalias**: Regras de negócio acionando alertas sobre *Desperdício Noturno* (máquinas operando fora do horário comercial), sobrecargas no limite do setor e consumo atípico por dispositivo.
* **Transparência e TV Mode**: Interface otimizada dedicada (`/transparency`) ideal para ser exposta de forma visível aos gestores, utilizando a analogia visual de um Semáforo (Cores Verde/Amarela/Vermelha).
* **Gestão de Tarifas e Metas**: Módulos para cadastro de tarifas (Convencional ou Bandeira) e metas com barras de progressão analíticas estimando os alcances no fim do mês.

## 🛠️ Como Executar o Frontend Localmente

### Pré-requisitos
* Um navegador moderno.
* Um ambiente capaz de hospedar páginas estáticas simples, por exemplo, usando a extensão **Live Server** (do VS Code) ou pelo terminal com Node/Python (ex: `npx serve .` na raiz do projeto).

### Passos
1. Faça o clone do repositório.
2. Abra um servidor local na pasta que contém o arquivo `index.html`.
3. Acesse via `http://localhost:5500` ou porta gerada.

> **⚠️ Nota de Demonstração:** Por padrão, a aplicação pode ser visualizada estaticamente. No arquivo `src/config.js`, caso a variável `DEMO_MODE` esteja como `true`, o sistema rodará carregando lógicas estáticas da pasta de `mocks/` para rápida prototipação de UI. Alterando para `false`, o app fará requisições externas em tempo real.

## 📚 Documentação Adicional (Em Andamento)
Os artefatos visuais pertinentes à Engenharia de Software estão sendo elaborados:
* `[ ]` Diagrama C4 Model da Arquitetura
* `[ ]` Diagramas de Casos de Uso (Atores vs Sistema)
* `[x]` Esquemas do Banco de Dados (JSON Tree Structure)
* `[x]` Código/Firmware e esquemático da conexão do microcontrolador (Wokwi)