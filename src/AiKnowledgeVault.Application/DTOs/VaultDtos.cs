namespace AiKnowledgeVault.Application.DTOs;

public sealed record CategoryDto(Guid Id, string Name, string? ColorCode);
public sealed record TagDto(Guid Id, string Name);
public sealed record NoteDto(
    Guid Id,
    string Title,
    string Content,
    bool IsImportant,
    Guid? CategoryId,
    string? CategoryName,
    IReadOnlyList<TagDto> Tags,
    DateTimeOffset CreatedAt,
    DateTimeOffset? UpdatedAt);

public sealed record SavedLinkDto(
    Guid Id,
    string Url,
    string Title,
    string? Description,
    string? SourceType,
    string? SourceCategory,
    bool IsImportant,
    Guid? CategoryId,
    string? CategoryName,
    IReadOnlyList<TagDto> Tags,
    DateTimeOffset CreatedAt,
    DateTimeOffset? UpdatedAt);

public sealed record SearchResultDto(IReadOnlyList<NoteDto> Notes, IReadOnlyList<SavedLinkDto> Links);
public sealed record BulkSavedLinkImportItem(string Url, string Title, string? Description, string? SourceType, string? SourceCategory, bool AllowDuplicate);
public sealed record BulkSavedLinkImportCommand(IReadOnlyList<BulkSavedLinkImportItem> Links);
public sealed record BulkSavedLinkImportResultDto(int RequestedCount, int CreatedCount, int DuplicateCount, int FailedCount, IReadOnlyList<SavedLinkDto> CreatedLinks, IReadOnlyList<BulkSavedLinkImportIssueDto> Issues);
public sealed record BulkSavedLinkImportIssueDto(string Url, string Reason);
