# Pokémon Management API - Desafio Técnico Leany

Esta é uma API REST desenvolvida para o gerenciamento de treinadores, times e Pokémon, com integração à PokéAPI e ViaCEP.

## 1. Arquitetura e Decisões Técnicas

A aplicação foi estruturada seguindo princípios de **Clean Architecture** e **Domain-Driven Design (DDD)**, dividindo as responsabilidades por domínios de negócio: `Trainer`, `Team` e `Pokemon`.

### Stack Tecnológica
- **Framework:** NestJS (v11+)
- **ORM:** TypeORM
- **Banco de Dados:** PostgreSQL 15
- **Validação:** Zod (via `nestjs-zod`)
- **Containerização:** Docker & Docker-compose
- **Testes:** Jest & Testcontainers (PostgreSQL)

---

## 2. Modelagem de Dados

O modelo de dados foi desenhado para garantir integridade referencial e performance:
- **Trainer:** Possui uma relação `OneToMany` com `Address` e `Team`. Implementa **Soft Delete** (`deletedAt`) para preservação de dados históricos.
- **Team:** Vinculado a um único treinador.
- **TeamPokemon:** Entidade de associação entre `Team` e `Pokemon`. Essa estrutura permite metadados futuros na relação, se necessário.
- **Pokemon:** Entidade local que espelha dados da PokéAPI. Possui índices em `name` e `id` (externo) para otimização de busca.

---

## 3. Estratégia de Persistência e Sincronização (PokéAPI)

1.  **Sincronização Sob Demanda (TTL):** Ao buscar um Pokémon, o sistema verifica se ele existe no banco local. 
    - Se não existir ou se os dados forem mais antigos que **7 dias (TTL)**, uma chamada à PokéAPI é realizada e o banco local é atualizado.
2.  **Sincronização em Massa (Cron Job):** Implementamos um processo agendado (`PokemonCron`) que roda diariamente às 03:00 AM.
    - O processo utiliza **Bulk Insert (Upsert)** via Repository.
3.  **Idempotência:** A estratégia de `upsert` baseada no `id` garante que a execução repetida do Cron não duplique dados e mantenha os nomes atualizados.

---

## 4. Regras de Negócio Implementadas

### Gestão de Treinadores
- **Regra de Exclusão:** Um treinador com times ativos **não pode ser removido**. O sistema retorna `409 Conflict` caso haja essa tentativa. Para remover um treinador, é necessário primeiro remover seus times.
- **Integração ViaCEP:** Ao cadastrar um treinador informando um CEP, o sistema consome o serviço externo e **persiste** o endereço completo. Escolhemos a persistência para garantir que o endereço do treinador no momento do cadastro seja preservado, independente de alterações futuras no serviço de CEP.

### Gestão de Times
- **Limite por Time:** Cada time pode conter no máximo **5 Pokémon**. Essa regra é validada na camada de serviço e reforçada pela integridade da transação.
- **Unicidade:** Não é permitido adicionar o mesmo Pokémon ao mesmo time.
- **Transacionalidade:** Todas as operações de escrita composta (ex: criar treinador + endereço ou adicionar pokemon + atualizar contador) são executadas dentro de **Database Transactions (ACID)** para evitar estados inconsistentes em caso de falhas de rede ou banco.

---

## 5. Qualidade e Testes

A suíte de testes foi dividida em dois níveis para garantir confiança sem comprometer a velocidade do CI:

1.  **Testes Unitários:** Focados na lógica pura dos serviços e mappers.
2.  **Testes de Integração (Testcontainers):** 
    - Utilizamos o **Testcontainers** para subir uma instância real de PostgreSQL em Docker durante os testes.
    - Isso permite validar transações reais e comportamentos do TypeORM que mocks simples de memória não capturam adequadamente.
    - Localização: `test/integration/`.

---

## 6. Como Executar

### Pré-requisitos
- Docker e Docker Compose instalados.
- Node.js 20+.

### Instalação e Execução
1.  Clone o repositório.
    ```bash
    git clone https://github.com/diegojimenes/Leany.git
    ```
    
3.  Suba o banco de dados:
    ```bash
    docker-compose up -d
    ```
4.  Instale as dependências:
    ```bash
    npm install
    ```
5.  Execute a aplicação:
    ```bash
    npm run start:dev
    ```

### Executando Testes
- **Unitários:** `npm run test`
- **Integração (Requer Docker):** `npm run test:integration`

---

## 7. Endpoints Principais (Resumo)

- `POST /trainers`: Cria treinador e integra com ViaCEP.
- `GET /trainers`: Lista treinadores com seus endereços e times.
- `POST /teams`: Cria um time vinculado a um treinador.
- `POST /teams/:id/pokemon`: Adiciona um Pokémon ao time (valida limite e existência local/remota).
- `GET /api/docs`: Documentação Swagger completa da API.
