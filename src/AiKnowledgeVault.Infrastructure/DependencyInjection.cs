using AiKnowledgeVault.Application.Interfaces;
using AiKnowledgeVault.Infrastructure.Auth;
using AiKnowledgeVault.Infrastructure.Persistence;
using AiKnowledgeVault.Infrastructure.Persistence.Repositories;
using AiKnowledgeVault.Infrastructure.Search;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace AiKnowledgeVault.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? "Host=localhost;Port=5432;Database=ai_knowledge_vault;Username=postgres;Password=postgres";

        services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IVaultSearchService, VaultSearchService>();
        services.AddScoped<IUserContext, MockUserContext>();

        return services;
    }
}
