using AiKnowledgeVault.Domain.Entities;

namespace AiKnowledgeVault.Application.Interfaces;

public interface IUnitOfWork
{
    IGenericRepository<Note> Notes { get; }
    IGenericRepository<SavedLink> SavedLinks { get; }
    IGenericRepository<Category> Categories { get; }
    IGenericRepository<Tag> Tags { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
