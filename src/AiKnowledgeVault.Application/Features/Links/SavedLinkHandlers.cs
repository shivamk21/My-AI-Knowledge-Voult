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

    public async Task<BulkSavedLinkImportResultDto> BulkImportAsync(BulkSavedLinkImportCommand command, CancellationToken cancellationToken)
    {
        var requestedLinks = command.Links.Take(5000).ToList();
        var issues = new List<BulkSavedLinkImportIssueDto>();
        var candidates = new List<BulkSavedLinkImportItem>();

        foreach (var item in requestedLinks)
        {
            if (!TryTrimRequired(item.Url, 1000, out var url, out var urlIssue))
            {
                issues.Add(new BulkSavedLinkImportIssueDto(item.Url, urlIssue));
                continue;
            }

            if (!Uri.TryCreate(url, UriKind.Absolute, out _))
            {
                issues.Add(new BulkSavedLinkImportIssueDto(item.Url, "Invalid URL"));
                continue;
            }

            if (!TryTrimRequired(item.Title, 200, out var title, out var titleIssue))
            {
                issues.Add(new BulkSavedLinkImportIssueDto(item.Url, titleIssue));
                continue;
            }

            if (!TryTrimOptional(item.Description, 2000, out var description, out var descriptionIssue))
            {
                issues.Add(new BulkSavedLinkImportIssueDto(item.Url, descriptionIssue ?? "Invalid description"));
                continue;
            }

            if (!TryTrimOptional(item.SourceType, 100, out var sourceType, out var sourceTypeIssue))
            {
                issues.Add(new BulkSavedLinkImportIssueDto(item.Url, sourceTypeIssue ?? "Invalid source type"));
                continue;
            }

            if (!TryTrimOptional(item.SourceCategory, 500, out var sourceCategory, out var sourceCategoryIssue))
            {
                issues.Add(new BulkSavedLinkImportIssueDto(item.Url, sourceCategoryIssue ?? "Invalid source category"));
                continue;
            }

            candidates.Add(item with
            {
                Url = url,
                Title = title,
                Description = description,
                SourceType = sourceType,
                SourceCategory = sourceCategory
            });
        }

        var existingUrls = await unitOfWork.SavedLinks.Query()
            .Where(link => !link.IsDeleted)
            .Select(link => link.Url)
            .ToListAsync(cancellationToken);
        var existingUrlSet = existingUrls.Select(NormalizeUrl).ToHashSet(StringComparer.OrdinalIgnoreCase);
        var seenInRequest = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var linksToCreate = new List<SavedLink>();
        var duplicateCount = 0;

        foreach (var item in candidates)
        {
            var normalizedUrl = NormalizeUrl(item.Url);
            var isDuplicate = existingUrlSet.Contains(normalizedUrl) || !seenInRequest.Add(normalizedUrl);

            if (isDuplicate && !item.AllowDuplicate)
            {
                duplicateCount += 1;
                issues.Add(new BulkSavedLinkImportIssueDto(item.Url, existingUrlSet.Contains(normalizedUrl) ? "Duplicate saved link" : "Duplicate in import"));
                continue;
            }

            linksToCreate.Add(new SavedLink
            {
                Url = item.Url,
                Title = item.Title,
                Description = item.Description,
                SourceType = item.SourceType,
                SourceCategory = item.SourceCategory,
                IsImportant = false
            });
        }

        foreach (var link in linksToCreate)
        {
            await unitOfWork.SavedLinks.AddAsync(link, cancellationToken);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        var createdIds = linksToCreate.Select(link => link.Id).ToList();
        var createdLinks = await unitOfWork.SavedLinks.Query()
            .Include(link => link.Category)
            .Include(link => link.SavedLinkTags).ThenInclude(linkTag => linkTag.Tag)
            .Where(link => createdIds.Contains(link.Id))
            .OrderByDescending(link => link.CreatedAt)
            .ToListAsync(cancellationToken);

        return new BulkSavedLinkImportResultDto(
            requestedLinks.Count,
            createdLinks.Count,
            duplicateCount,
            issues.Count - duplicateCount,
            createdLinks.Select(link => link.ToDto()).ToList(),
            issues);
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

    public async Task<IReadOnlyList<SavedLinkDto>> GetImportedAsync(ImportedLinksQuery query, CancellationToken cancellationToken)
    {
        var links = unitOfWork.SavedLinks.Query()
            .Include(l => l.Category)
            .Include(l => l.SavedLinkTags).ThenInclude(lt => lt.Tag)
            .Where(link => !link.IsDeleted && link.SourceType != null);

        if (!string.IsNullOrWhiteSpace(query.Keyword))
        {
            var keyword = query.Keyword.Trim().ToLower();
            links = links.Where(link =>
                link.Title.ToLower().Contains(keyword) ||
                link.Url.ToLower().Contains(keyword) ||
                (link.Description != null && link.Description.ToLower().Contains(keyword)) ||
                (link.SourceCategory != null && link.SourceCategory.ToLower().Contains(keyword)) ||
                (link.SourceType != null && link.SourceType.ToLower().Contains(keyword)));
        }

        var items = await links.OrderByDescending(link => link.CreatedAt).ToListAsync(cancellationToken);
        return items.Select(link => link.ToDto()).ToList();
    }

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

    private static string NormalizeUrl(string url) => url.Trim().TrimEnd('/');

    private static bool TryTrimRequired(string? value, int maxLength, out string trimmed, out string issue)
    {
        trimmed = value?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(trimmed))
        {
            issue = "Required value is missing";
            return false;
        }

        if (trimmed.Length > maxLength)
        {
            issue = $"Value must be {maxLength} characters or fewer";
            return false;
        }

        issue = string.Empty;
        return true;
    }

    private static bool TryTrimOptional(string? value, int maxLength, out string? trimmed, out string? issue)
    {
        trimmed = value?.Trim();
        if (string.IsNullOrWhiteSpace(trimmed))
        {
            trimmed = null;
            issue = null;
            return true;
        }

        if (trimmed.Length > maxLength)
        {
            issue = $"Value must be {maxLength} characters or fewer";
            return false;
        }

        issue = null;
        return true;
    }
}
