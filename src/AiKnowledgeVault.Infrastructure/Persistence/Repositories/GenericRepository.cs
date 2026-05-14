using AiKnowledgeVault.Application.Interfaces;
using AiKnowledgeVault.Domain.Common;
using Microsoft.EntityFrameworkCore;

namespace AiKnowledgeVault.Infrastructure.Persistence.Repositories;

public sealed class GenericRepository<T>(AppDbContext dbContext) : IGenericRepository<T> where T : BaseEntity
{
    private readonly DbSet<T> _set = dbContext.Set<T>();

    public IQueryable<T> Query() => _set.AsQueryable();

    public Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        _set.FirstOrDefaultAsync(e => e.Id == id && !e.IsDeleted, cancellationToken);

    public async Task<IReadOnlyList<T>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await _set.Where(e => !e.IsDeleted).ToListAsync(cancellationToken);

    public Task AddAsync(T entity, CancellationToken cancellationToken = default) =>
        _set.AddAsync(entity, cancellationToken).AsTask();

    public void Update(T entity) => _set.Update(entity);

    public void Delete(T entity)
    {
        entity.IsDeleted = true;
        entity.UpdatedAt = DateTimeOffset.UtcNow;
        _set.Update(entity);
    }
}
