using AiKnowledgeVault.Application;
using AiKnowledgeVault.Application.DTOs;
using AiKnowledgeVault.Application.Interfaces;
using AiKnowledgeVault.Application.Mapping;
using AiKnowledgeVault.Domain.Entities;
using AiKnowledgeVault.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AiKnowledgeVault.Infrastructure.Search;

public sealed class VaultSearchService(AppDbContext dbContext) : IVaultSearchService
{
    public async Task<IReadOnlyList<NoteDto>> SearchNotesAsync(SearchVaultQuery query, CancellationToken cancellationToken = default)
    {
        var notes = dbContext.Notes
            .Include(n => n.Category)
            .Include(n => n.NoteTags).ThenInclude(nt => nt.Tag)
            .Where(n => !n.IsDeleted);

        notes = ApplyNoteFilters(notes, query);
        var items = await notes.OrderByDescending(n => n.UpdatedAt ?? n.CreatedAt).ToListAsync(cancellationToken);
        return items.Select(n => n.ToDto()).ToList();
    }

    public async Task<IReadOnlyList<SavedLinkDto>> SearchLinksAsync(SearchVaultQuery query, CancellationToken cancellationToken = default)
    {
        var links = dbContext.SavedLinks
            .Include(l => l.Category)
            .Include(l => l.SavedLinkTags).ThenInclude(lt => lt.Tag)
            .Where(l => !l.IsDeleted);

        links = ApplyLinkFilters(links, query);
        var items = await links.OrderByDescending(l => l.UpdatedAt ?? l.CreatedAt).ToListAsync(cancellationToken);
        return items.Select(l => l.ToDto()).ToList();
    }

    public async Task<SearchResultDto> SearchVaultAsync(SearchVaultQuery query, CancellationToken cancellationToken = default)
    {
        var notes = await SearchNotesAsync(query, cancellationToken);
        var links = await SearchLinksAsync(query, cancellationToken);
        return new SearchResultDto(notes, links);
    }

    private static IQueryable<Note> ApplyNoteFilters(IQueryable<Note> notes, SearchVaultQuery query)
    {
        if (!string.IsNullOrWhiteSpace(query.Keyword))
        {
            var pattern = $"%{query.Keyword.Trim()}%";
            notes = notes.Where(n =>
                EF.Functions.ILike(n.Title, pattern) ||
                EF.Functions.ILike(n.Content, pattern) ||
                (n.Category != null && EF.Functions.ILike(n.Category.Name, pattern)) ||
                n.NoteTags.Any(nt => EF.Functions.ILike(nt.Tag.Name, pattern)));
        }

        if (query.CategoryId.HasValue)
        {
            notes = notes.Where(n => n.CategoryId == query.CategoryId);
        }

        if (query.TagId.HasValue)
        {
            notes = notes.Where(n => n.NoteTags.Any(nt => nt.TagId == query.TagId));
        }

        if (query.IsImportant.HasValue)
        {
            notes = notes.Where(n => n.IsImportant == query.IsImportant);
        }

        return notes;
    }

    private static IQueryable<SavedLink> ApplyLinkFilters(IQueryable<SavedLink> links, SearchVaultQuery query)
    {
        if (!string.IsNullOrWhiteSpace(query.Keyword))
        {
            var pattern = $"%{query.Keyword.Trim()}%";
            links = links.Where(l =>
                EF.Functions.ILike(l.Title, pattern) ||
                EF.Functions.ILike(l.Url, pattern) ||
                (l.Description != null && EF.Functions.ILike(l.Description, pattern)) ||
                (l.Category != null && EF.Functions.ILike(l.Category.Name, pattern)) ||
                l.SavedLinkTags.Any(lt => EF.Functions.ILike(lt.Tag.Name, pattern)));
        }

        if (query.CategoryId.HasValue)
        {
            links = links.Where(l => l.CategoryId == query.CategoryId);
        }

        if (query.TagId.HasValue)
        {
            links = links.Where(l => l.SavedLinkTags.Any(lt => lt.TagId == query.TagId));
        }

        if (query.IsImportant.HasValue)
        {
            links = links.Where(l => l.IsImportant == query.IsImportant);
        }

        return links;
    }
}
