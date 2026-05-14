using AiKnowledgeVault.Application.Interfaces;
using AiKnowledgeVault.Domain.Entities;

namespace AiKnowledgeVault.Infrastructure.Persistence.Repositories;

public sealed class UnitOfWork(AppDbContext dbContext) : IUnitOfWork
{
    public IGenericRepository<Note> Notes { get; } = new GenericRepository<Note>(dbContext);
    public IGenericRepository<SavedLink> SavedLinks { get; } = new GenericRepository<SavedLink>(dbContext);
    public IGenericRepository<Category> Categories { get; } = new GenericRepository<Category>(dbContext);
    public IGenericRepository<Tag> Tags { get; } = new GenericRepository<Tag>(dbContext);

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
        dbContext.SaveChangesAsync(cancellationToken);
}
