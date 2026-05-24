# Lista de Tarefas - Reta Final (LumenFlow)

Este documento centraliza todas as tarefas necessárias para finalizar o projeto e prepará-lo para a apresentação de Engenharia de Software.

## 1. Camada de Hardware / IoT (Wokwi)
- [ ] **Criar projeto no Wokwi:** Iniciar um novo projeto com a placa ESP32.
- [ ] **Montar o Circuito (diagram.json):** 
  - Adicionar potenciômetros para atuar como os sensores de corrente dos setores/equipamentos.
  - Opcional: Adicionar LEDs indicadores de status (Conectando Wi-Fi, Enviando Dados).
- [ ] **Desenvolver o Firmware (C/C++):**
  - Implementar a conexão via Wi-Fi virtual (SSID: `Wokwi-GUEST`).
  - Implementar a leitura analógica (`analogRead`) dos potenciômetros e conversão do valor bruto para Corrente (A) e Potência (W).
  - Integrar biblioteca de HTTP Client para realizar chamadas REST (POST/PUT/PATCH) diretamente para o Firebase RTDB enviando o payload JSON gerado.

## 2. Integração e Configuração do Firebase
- [ ] **Definir Estrutura JSON:** Documentar a árvore exata que será salva no banco. Exemplo: `/sensores` e `/dashboard/readings/live`. Isso garantirá que o hardware envie dados compatíveis com o que o frontend espera receber no `mockHandler.js`.
- [ ] **Configurar Regras de Segurança (Rules):** No console do Firebase, ajustar as regras do Realtime Database para permitir leitura/escrita pública (somente para a apresentação) ou via token de autenticação.
  ```json
  {
    "rules": {
      ".read": true,
      ".write": true
    }
  }
  ```
- [ ] **Validar Comunicação de Ponta a Ponta:** Rodar o Wokwi e checar no painel do Firebase se os dados estão sendo atualizados dinamicamente de acordo com o movimento dos potenciômetros.

## 3. Ajustes no Frontend (Efeito "Tempo Real")
- [ ] **Diminuir o tempo de Polling:** No arquivo `src/config.js`, alterar temporariamente a variável `POLLING_INTERVAL_MS` de `30000` (30s) para um valor entre `2000` e `5000` (2s a 5s). Isso causará um impacto visual melhor durante a simulação ao vivo.
- [ ] **Revisão de Mock vs Real:** Decidir se, para fins de apresentação, todas as outras páginas (Alertas, Dispositivos, Financeiro) continuarão usando os dados estáticos (`MOCK_*`), mantendo o foco do "tempo real" exclusivamente na página de Dashboard e Consumo dos setores.
- [ ] **Limpar Console:** Verificar se existem erros no console do navegador (como promessas rejeitadas ou rotas não encontradas) e resolvê-los para passar uma imagem profissional na apresentação.

## 4. Documentação de Engenharia de Software (Artefatos)
- [ ] **Diagrama C4 Model:** Criar os diagramas de Contexto, Container e Componente explicando a arquitetura (Frontend Vanilla -> Firebase BaaS <- ESP32 Wokwi).
- [ ] **Diagramas de Casos de Uso:** Mapear de forma visual o que o "Gestor" ou "Operador" consegue fazer no sistema (ex: Visualizar consumo, Receber alertas de desperdício, etc).
- [ ] **Esquema do Banco de Dados:** Adicionar um documento formalizando a árvore JSON estruturada configurada na etapa do Firebase.
- [ ] **Atualizar o README.md:** Marcar os checkboxes do README original à medida que a documentação ficar pronta e adicionar prints/screenshots da interface finalizada.

---

> **Dica para a Apresentação:** Deixe o Wokwi aberto em metade da tela e o Dashboard na outra metade. Mova o potenciômetro e mostre aos avaliadores o gráfico reagindo em poucos segundos. Isso provará o conceito de ponta a ponta perfeitamente.
