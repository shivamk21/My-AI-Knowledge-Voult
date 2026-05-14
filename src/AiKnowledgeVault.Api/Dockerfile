FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY AiKnowledgeVault.slnx ./
COPY src/AiKnowledgeVault.Api/AiKnowledgeVault.Api.csproj src/AiKnowledgeVault.Api/
COPY src/AiKnowledgeVault.Application/AiKnowledgeVault.Application.csproj src/AiKnowledgeVault.Application/
COPY src/AiKnowledgeVault.Domain/AiKnowledgeVault.Domain.csproj src/AiKnowledgeVault.Domain/
COPY src/AiKnowledgeVault.Infrastructure/AiKnowledgeVault.Infrastructure.csproj src/AiKnowledgeVault.Infrastructure/
RUN dotnet restore src/AiKnowledgeVault.Api/AiKnowledgeVault.Api.csproj

COPY src/ src/
RUN dotnet publish src/AiKnowledgeVault.Api/AiKnowledgeVault.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "AiKnowledgeVault.Api.dll"]
