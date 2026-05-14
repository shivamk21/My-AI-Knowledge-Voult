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
    bool IsImportant,
    Guid? CategoryId,
    string? CategoryName,
    IReadOnlyList<TagDto> Tags,
    DateTimeOffset CreatedAt,
    DateTimeOffset? UpdatedAt);

public sealed record SearchResultDto(IReadOnlyList<NoteDto> Notes, IReadOnlyList<SavedLinkDto> Links);
