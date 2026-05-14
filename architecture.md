# AI Knowledge Vault Architecture Document

## 1. Executive Summary
The **AI Knowledge Vault** is a secure, scalable, and intelligent repository designed to consolidate fragmented personal and professional information. By leveraging .NET 8, React, and PostgreSQL, the system provides a robust platform for managing notes, links, and documents. The architecture follows a Clean Architecture (Onion) pattern with CQRS and DDD principles, ensuring maintainability and a clear path toward advanced AI-driven features like semantic search and automated summarization.

## 2. Problem Statement
Critical information (technical snippets, architectural references, business ideas, meeting notes) is currently scattered across disparate tools:
- Notepad files (unstructured)
- Browser bookmarks (static and hard to search)
- Teams/Slack/Email (ephemeral and siloed)
- Local folders and documents (difficult to index)

This fragmentation leads to significant time loss and mental overhead when trying to retrieve specific insights later.

## 3. Proposed Solution
A centralized web application that serves as a "Second Brain."
- **Capture:** Easily save notes, links, and documents.
- **Organize:** Use tags, categories, and "Important" flags.
- **Retrieve:** Instant keyword search in MVP, evolving into AI-powered semantic search.
- **Intelligence:** Future integration of LLMs for Q&A and summarization over saved content.

## 4. Business Value
- **Knowledge Retention:** Prevents the loss of valuable insights.
- **Productivity:** Reduces time spent searching for information.
- **Scalability:** Personal-first design that can evolve into a multi-tenant enterprise solution.
- **AI Readiness:** Built-in support for vector embeddings ensures the system stays at the cutting edge of AI capabilities.

## 5. MVP Scope
- **Backend:** .NET 8 Minimal API with Onion Architecture.
- **Frontend:** React + TypeScript + Material UI.
- **Persistence:** PostgreSQL with EF Core.
- **Features:** 
    - CRUD for Notes and Links.
    - Category and Tag management.
    - Keyword search and filtering.
    - Important flag toggle.
- **DevOps:** Docker Compose for local development.

## 6. Future Scope
- **AI Search:** Semantic search using `pgvector` and OpenAI/Azure OpenAI embeddings.
- **Document Management:** PDF/Word upload and indexing.
- **AI Insights:** Automated summaries and Q&A (RAG - Retrieval Augmented Generation).
- **Security:** Full Auth0 integration, RBAC, and encryption at rest for sensitive notes.
- **Collaboration:** Team workspaces and shared vaults.

## 7. High-Level Architecture
The system follows the **Onion Architecture** to keep the core domain logic independent of external concerns like databases or UI frameworks.

```
[ User Interface (React) ] <--> [ API (Minimal API) ]
                                      |
                               [ Application Layer ] (CQRS: Commands/Queries)
                                      |
                               [ Domain Layer ] (Entities, Value Objects, Domain Logic)
                                      /      \
               [ Infrastructure Layer ]      [ Persistence Layer ]
               (External Services, Auth)      (PostgreSQL, EF Core)
```

## 8. Technology Stack
- **Backend:** .NET 8
- **Frontend:** React 18, TypeScript, Material UI 5
- **Database:** PostgreSQL 16
- **ORM:** Entity Framework Core
- **Vector Search:** pgvector (PostgreSQL extension)
- **Logging:** Serilog
- **API Documentation:** Swagger / OpenAPI
- **Containerization:** Docker, Docker Compose

## 9. Solution Structure
- `AiKnowledgeVault.Api`: Entry point, Minimal API, Middleware, Controllers (or Endpoints).
- `AiKnowledgeVault.Application`: CQRS Handlers, DTOs, Mappers, Interfaces, Validation.
- `AiKnowledgeVault.Domain`: Entities, Aggregates, Value Objects, Domain Exceptions, Constants.
- `AiKnowledgeVault.Infrastructure`: EF Core DbContext, Repositories, File Storage, External API Clients.

## 10. Folder Structure
```text
/src
  /AiKnowledgeVault.Api
    /Endpoints
    /Middleware
    /Extensions
  /AiKnowledgeVault.Application
    /Features
      /Notes
        /Commands
        /Queries
      /Links
    /Interfaces
    /DTOs
    /Validators
  /AiKnowledgeVault.Domain
    /Entities
    /Common
    /Enums
  /AiKnowledgeVault.Infrastructure
    /Persistence
      /Migrations
      /Repositories
    /Logging
/web-ui
  /src
    /components
    /hooks
    /services
    /pages
    /theme
```

## 11. Project Responsibilities
- **Domain:** Defines the "what" (Notes, Links). Zero dependencies on other projects.
- **Application:** Defines the "how" (CreateNoteCommandHandler). Orchestrates domain objects.
- **Infrastructure:** Implements technical details (SQL queries, File saving).
- **Api:** Handles HTTP requests and response formatting.

## 12. Domain Model Design
We use a Domain-Driven Design approach where the domain entities encapsulate state and ensure consistency.

### 13. Entities
- **BaseEntity:** `Id`, `CreatedAt`, `UpdatedAt`.
- **Note:** `Title`, `Content`, `IsImportant`, `CategoryId`.
- **SavedLink:** `Url`, `Description`, `Title`, `CategoryId`.
- **Category:** `Name`, `ColorCode`.
- **Tag:** `Name`.
- **NoteTag / LinkTag:** Join tables for Many-to-Many relationships.
- **User (Placeholder):** `ExternalId` (from Auth0), `Email`, `FullName`.

### 14. Value Objects (Future)
- **NoteEmbedding:** `float[]` representing the vector.

## 15. CQRS Design
Separating Read and Write operations using MediatR.

### 16. Commands and Queries
- **Commands:** `CreateNoteCommand`, `UpdateNoteCommand`, `DeleteNoteCommand`, `MarkAsImportantCommand`.
- **Queries:** `GetNotesQuery` (with filters), `GetNoteByIdQuery`, `SearchVaultQuery`.

## 17. API Endpoint Design
Sample Minimal API structure:
- `GET /api/notes` - Returns filtered/paged notes.
- `POST /api/notes` - Creates a new note.
- `GET /api/notes/{id}` - Returns specific note.
- `PUT /api/notes/{id}` - Updates a note.
- `DELETE /api/notes/{id}` - Soft/Hard delete.
- `GET /api/categories` - List categories.

**Sample Request (POST /api/notes):**
```json
{
  "title": "Architecture Patterns",
  "content": "Onion architecture is great for testability...",
  "categoryId": "uuid-here",
  "tagIds": ["tag-uuid-1", "tag-uuid-2"],
  "isImportant": true
}
```

**Sample Response:**
```json
{
  "id": "new-uuid",
  "title": "Architecture Patterns",
  "createdAt": "2024-05-10T10:00:00Z"
}
```

## 18. Repository Design
We use a **Generic Repository Pattern** to standardize CRUD operations while allowing specialized repositories for complex queries.

### 19. Generic Repository Pattern
`IGenericRepository<T>` provides:
- `Task<T> GetByIdAsync(Guid id);`
- `Task<IEnumerable<T>> GetAllAsync();`
- `Task AddAsync(T entity);`
- `void Update(T entity);`
- `void Delete(T entity);`

## 20. EF Core and PostgreSQL Design
- Use `Fluent API` for configurations (e.g., `builder.HasKey(x => x.Id)`).
- Enable `Snake_Case` naming convention via Npgsql.
- **Indexes:** Add B-Tree indexes on `Title` and `CategoryId`.

## 21. pgvector and Semantic Search Future Design
- **Extension:** `CREATE EXTENSION IF NOT EXISTS vector;`
- **Storage:** Add a `Vector` column to `Note` entity (size 1536 for OpenAI).
- **Search:** Use `<->` (L2 distance) or `<#>` (inner product) for similarity search in SQL.
- **Flow:** User query -> Generate Embedding (via OpenAI API) -> PostgreSQL Vector Search -> Return Results.

## 22. Authentication and Authorization Placeholder
- MVP will use a `MockUserFilter` or simply skip auth checks.
- Architecture will include `IUserContext` interface to be injected into handlers.
- Future: Auth0 will provide JWTs; `IUserContext` will extract the `sub` claim.

## 23. Logging Design using Serilog
- Structured logging to Console and File.
- Include `CorrelationId` in all logs.
- Enrich logs with `Environment`, `MachineName`, and `UserId`.

## 24. Global Exception Handling
- Middleware to catch all unhandled exceptions.
- Returns `ProblemDetails` (RFC 7807) standard response.
- Logs full stack trace internally but returns clean message to client.

## 25. Validation Strategy
- **FluentValidation:** Used in the Application layer to validate Commands/Queries before they reach the handler.
- Example: `RuleFor(x => x.Title).NotEmpty().MaximumLength(200);`

## 26. Docker and Docker Compose Design
`docker-compose.yml` will include:
1. `db`: postgres:16-alpine (with pgvector installed or standard).
2. `api`: .NET 8 API image.
3. `ui`: Node image for React dev server (optional, usually run locally).

## 27. Frontend Architecture
### 28. React Component Structure
- `src/components/common`: Buttons, Inputs, Layouts.
- `src/components/notes`: NoteCard, NoteEditor, NoteList.
- `src/features`: Complex logic grouped by domain.
- `src/services`: API client (Axios) wrappers.

### 29. Material UI Design Approach
- Use `ThemeProvider` for consistent colors.
- Responsive Grid for Note cards.
- Dark mode support (preferred for technical users).

## 30. Search Flow
- **Keyword Search (MVP):** Use EF Core `EF.Functions.ILike` to search `Title` and `Content` fields.
- **Filtering:** Combine keyword search with Tag and Category ID filters in the SQL `WHERE` clause.

## 31. Future AI Search Flow
1. User enters: "How does Onion architecture work?"
2. System calls OpenAI Embedding API to get vector `[0.12, -0.05, ...]`.
3. System runs: `SELECT * FROM Notes ORDER BY Embedding <-> '[0.12, ...]' LIMIT 5;`
4. Results are displayed based on conceptual similarity, even if "Onion" isn't explicitly in the text.

## 32. Deployment Strategy
- **Stage 1:** Docker Compose on a VPS (e.g., DigitalOcean, Hetzner).
- **Stage 2:** Azure App Service + Azure Database for PostgreSQL.
- **CI/CD:** GitHub Actions to build and push Docker images.

## 33. Security Considerations
- **Data Protection:** Sanitizing HTML content if Markdown/RichText is used.
- **CORS:** Restrict to specific origins.
- **SQL Injection:** Prevented by EF Core parameterized queries.

## 34. Configuration Management
- `appsettings.json` for non-sensitive defaults.
- `Environment Variables` for Secrets (Database connection string, API Keys).

## 35. Testing Strategy
- **Unit Tests:** XUnit for Domain and Application logic.
- **Integration Tests:** WebApplicationFactory + Testcontainers (PostgreSQL) for API testing.

## 36. Development Roadmap
1. **Phase 1:** Backend Solution setup, Domain Entities, EF Core Migrations.
2. **Phase 2:** CQRS Handlers and Minimal API Endpoints.
3. **Phase 3:** React Project setup, API integration, Theme implementation.
4. **Phase 4:** Search and Filtering logic.
5. **Phase 5 (Future):** AI Integration.

## 37. Demo Flow
1. Open React UI -> Dashboard.
2. Create a Note "Meeting with Stakeholders".
3. Add a Link "https://react.dev" with category "Technical".
4. Toggle "Important" on a note.
5. Use the Search bar to find "Stakeholders".
6. Filter by "Technical" category.

## 38. Interview Q&A
- **Q:** Why Onion Architecture?
- **A:** To ensure the core business logic is decoupled from external concerns, making it easier to test and swap databases or UI frameworks later.
- **Q:** How will you handle semantic search?
- **A:** By using `pgvector` in PostgreSQL to store embeddings and performing similarity searches using vector distance operators.
- **Q:** Why Minimal API instead of Controllers?
- **A:** For a cleaner, more lightweight entry point with less boilerplate, which is perfect for modern microservices/small-scale apps.
- **Q:** How do you handle many-to-many tags?
- **A:** EF Core manages the join table, and we expose it via the Application layer to allow attaching multiple tags to a single note.
