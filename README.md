# LumenFlow - Dashboard Inteligente de Gestão de Energia IoT

<p align="center">
  <img src="https://img.shields.io/badge/Status-Em_Desenvolvimento-warning" alt="Status">
  <img src="https://img.shields.io/badge/Version-2.0.0-blue" alt="Versão">
  <img src="https://img.shields.io/badge/PHP-8.3-purple" alt="PHP">
  <img src="https://img.shields.io/badge/Laravel-13-red" alt="Laravel">
  <img src="https://img.shields.io/badge/SQLite-3-blue" alt="SQLite">
  <img src="https://img.shields.io/badge/Vite-8-blueviolet" alt="Vite">
  <img src="https://img.shields.io/badge/TailwindCSS-4-38B2AC" alt="Tailwind CSS">
</p>

<p align="center">
  <i>Monitoramento em tempo real de equipamentos em setores com simulação IoT, agora mais robusto e ágil.</i>
</p>

## 🚀 Sobre o Projeto

O **LumenFlow** é um sistema completo de monitoramento energético IoT para varejo, capaz de processar informações de equipamentos em diferentes setores. Após uma reestruturação profunda de arquitetura e tecnologia, o sistema simula equipamentos, enviando dados em tempo real para o Firebase e exibindo informações de alto valor através de uma interface web ultrarrápida.

### ✨ Funcionalidades

- 📊 **Dashboard em Tempo Real** - Monitoramento de equipamentos simultâneos de forma instantânea.
- 🔌 **Simulação IoT** - Integração contínua e robusta via Wokwi.
- 📈 **Agregação por Setores** - Segmentação inteligente para análise aprofundada (Refrigeração, Iluminação, Equipamentos, Escritório).
- 💰 **Cálculo de Custos** - Estimativas financeiras do consumo energético e relatórios em PDF.
- 🔐 **Sistema de Autenticação** - Registro, login e proteção de rotas/endpoints da API de forma segura com Laravel Sanctum.
- 📱 **Interface Responsiva** - Frontend repaginado com Vite e TailwindCSS para uma UX de ponta.

## 🛠️ Tecnologias Utilizadas

### Backend
- **[Laravel 13](https://laravel.com/)** - Framework PHP moderno.
- **[SQLite](https://www.sqlite.org/)** - Banco de dados relacional leve e poderoso.
- **[Sanctum](https://laravel.com/docs/sanctum)** - Autenticação da API robusta.
- **[Firebase PHP (kreait)](https://github.com/kreait/firebase-php)** - Integração com o Firebase.
- **[Laravel DOMPDF](https://github.com/barryvdh/laravel-dompdf)** - Geração de relatórios PDF.
- **[Mailhog](https://github.com/mailhog/MailHog)** - Ferramenta de teste de e-mail local.

### Frontend
- **[Vite 8](https://vitejs.dev/)** - Build tool ultra-rápido para projetos web.
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Framework CSS utilitário para estilização ágil e flexível.
- **[Vanilla JavaScript](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)** - Sem dependências pesadas, focado em alta performance.

### IoT & Cloud
- **[Wokwi Web IDE](https://wokwi.com/)** - Simulação de hardware IoT.
- **[Firebase RTDB & Auth](https://firebase.google.com/)** - Sincronização em tempo real e autenticação auxiliar.

## 📦 Estrutura do Projeto

```text
LumenFlow/
├── backend/                    ← API Laravel (PHP 8.3 / Laravel 13)
│   ├── app/                    ← Lógica da aplicação, Models, Controllers
│   ├── database/               ← Migrations, Seeders e banco SQLite
│   ├── routes/                 ← Definição de endpoints (api.php)
│   ├── .env                    ← Variáveis de ambiente
│   ├── composer.json           ← Dependências backend
│   └── mailhog.exe             ← Executável para testes de e-mail local
├── frontend/                   ← Aplicação Frontend (Vite + Tailwind)
│   ├── src/                    ← Código-fonte (JS, CSS)
│   ├── index.html              ← Entry point principal
│   ├── package.json            ← Dependências frontend
│   └── vite.config.js          ← Configuração do Vite
├── iot/                        ← Scripts e configurações de Simulação IoT
│   └── monitor-iot.js          ← Script de monitoramento em Node.js
└── README.md                   ← Documentação principal
```

## 🚀 Como Executar (Pré-requisitos e Instalação)

### Pré-requisitos

- **PHP 8.3+** e **Composer** instalados.
- **Node.js** (versão LTS recomendada).
- Sistema Operacional: Windows (devido ao uso do `mailhog.exe` fornecido, ou Mailhog genérico para outros SOs).

### 1. Clonando o Repositório

```bash
git clone https://github.com/seu-usuario/LumenFlow.git
cd LumenFlow
```

### 2. Configurando e Rodando o Backend (API Laravel)

```bash
cd backend

# Instale as dependências do PHP
composer install

# Crie o arquivo .env a partir do exemplo e configure as variáveis
cp .env.example .env

# Gere a chave da aplicação Laravel
php artisan key:generate

# Crie o banco de dados e execute as migrações (SQLite)
# Certifique-se de que a conexão DB_CONNECTION=sqlite está no seu .env
php artisan migrate

# Opcional: Popular o banco com dados de teste
php artisan db:seed
```

**Observação:** Lembre-se de configurar corretamente suas credenciais Firebase no arquivo `backend/.env`.

### 3. Configurando o Frontend (Vite)

```bash
cd frontend

# Instale as dependências do Node.js
npm install
```

## 🏃 Como Rodar o Projeto (Ambiente de Desenvolvimento)

Para executar o projeto completo localmente, você deve rodar os três serviços a seguir, abrindo **três terminais separados**.

**Terminal 1: Mailhog (Captura de E-mails locais)**
```bash
cd backend
./mailhog.exe
```
O painel do Mailhog estará acessível em `http://localhost:8025`.

**Terminal 2: Servidor Backend Laravel**
```bash
cd backend
php artisan serve
```
A API estará disponível em `http://localhost:8000`.

**Terminal 3: Servidor Frontend**
```bash
cd frontend
npm run dev
```
O Vite iniciará o frontend de maneira instantânea. Acesse a URL indicada no terminal (normalmente `http://localhost:5173`).

### Atalho: Rodando Front e Back juntos
Caso prefira, o `package.json` do frontend possui um script para rodar tudo simultaneamente (Vite + Artisan Serve):
```bash
cd frontend
npm run dev:full
```
*(Certifique-se que o mailhog já esteja em execução em outro terminal se for usar envios de e-mail).*

## 🔗 Endpoints Principais (API)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/login` | Autenticação do usuário (via Sanctum) |
| `POST` | `/api/register`| Registro de novos usuários |
| `GET`  | `/api/dashboard` | Retorna os dados do painel |
| `GET`  | `/api/reports` | Gera relatórios em PDF |

*(Consulte `backend/routes/api.php` para a lista completa).*

## 🤝 Contribuição

O projeto está passando por diversas melhorias arquiteturais e tecnológicas. Contribuições são muito bem-vindas!
1. Faça o Fork do projeto.
2. Crie sua branch de feature (`git checkout -b feature/nova-funcionalidade`).
3. Commit suas alterações (`git commit -m 'feat: adiciona funcionalidade X'`).
4. Faça o Push para a branch (`git push origin feature/nova-funcionalidade`).
5. Abra um Pull Request detalhado.

## 📄 Licença

Este projeto está sob licença MIT. Veja o arquivo `LICENSE` para mais detalhes.
