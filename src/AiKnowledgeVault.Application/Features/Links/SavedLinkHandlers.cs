using AiKnowledgeVault.Application.DTOs;
using AiKnowledgeVault.Application.Interfaces;
using AiKnowledgeVault.Application.Mapping;
using AiKnowledgeVault.Application.Validation;
using AiKnowledgeVault.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AiKnowledgeVault.Application.Features.Links;

public sealed class SavedLinkHandlers(IUnitOfWork unitOfWork, IVaultSearchService searchService)
{
    public async Task<SavedLinkDto> CreateAsync(CreateSavedLinkCommand command, CancellationToken cancellationToken)
    {
        var link = new SavedLink
        {
            Url = Ensure.Required(command.Url, "URL", 1000),
            Title = Ensure.Required(command.Title, "Title", 200),
            Description = Ensure.Optional(command.Description, 2000),
            CategoryId = command.CategoryId,
            IsImportant = command.IsImportant
        };

        await SetTagsAsync(link, command.TagIds, cancellationToken);
        await unitOfWork.SavedLinks.AddAsync(link, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return (await GetByIdAsync(link.Id, cancellationToken))!;
    }

    public async Task<IReadOnlyList<SavedLinkDto>> GetAllAsync(CancellationToken cancellationToken) =>
        await searchService.SearchLinksAsync(new SearchVaultQuery(null, null, null, null), cancellationToken);

    public async Task<SavedLinkDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var link = await unitOfWork.SavedLinks.Query()
            .Include(l => l.Category)
            .Include(l => l.SavedLinkTags).ThenInclude(lt => lt.Tag)
            .FirstOrDefaultAsync(l => l.Id == id && !l.IsDeleted, cancellationToken);

        return link?.ToDto();
    }

    public async Task<SavedLinkDto?> UpdateAsync(UpdateSavedLinkCommand command, CancellationToken cancellationToken)
    {
        var link = await unitOfWork.SavedLinks.Query()
            .Include(l => l.SavedLinkTags)
            .FirstOrDefaultAsync(l => l.Id == command.Id && !l.IsDeleted, cancellationToken);

        if (link is null)
        {
            return null;
        }

        link.Url = Ensure.Required(command.Url, "URL", 1000);
        link.Title = Ensure.Required(command.Title, "Title", 200);
        link.Description = Ensure.Optional(command.Description, 2000);
        link.CategoryId = command.CategoryId;
        link.IsImportant = command.IsImportant;
        link.UpdatedAt = DateTimeOffset.UtcNow;
        await SetTagsAsync(link, command.TagIds, cancellationToken);
        unitOfWork.SavedLinks.Update(link);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return await GetByIdAsync(link.Id, cancellationToken);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var link = await unitOfWork.SavedLinks.GetByIdAsync(id, cancellationToken);
        if (link is null)
        {
            return false;
        }

        unitOfWork.SavedLinks.Delete(link);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    public Task<IReadOnlyList<SavedLinkDto>> SearchAsync(SearchVaultQuery query, CancellationToken cancellationToken) =>
        searchService.SearchLinksAsync(query, cancellationToken);

    private async Task SetTagsAsync(SavedLink link, IReadOnlyList<Guid>? tagIds, CancellationToken cancellationToken)
    {
        link.SavedLinkTags.Clear();
        foreach (var tagId in tagIds?.Distinct() ?? [])
        {
            var tagExists = await unitOfWork.Tags.Query().AnyAsync(t => t.Id == tagId && !t.IsDeleted, cancellationToken);
            if (!tagExists)
            {
                throw new ValidationException($"Tag '{tagId}' does not exist.");
            }

            link.SavedLinkTags.Add(new SavedLinkTag { SavedLinkId = link.Id, TagId = tagId });
        }
    }
}
