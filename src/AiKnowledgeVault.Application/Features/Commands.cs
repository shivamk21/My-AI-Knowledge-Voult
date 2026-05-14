namespace AiKnowledgeVault.Application;

public sealed record CreateNoteCommand(string Title, string Content, Guid? CategoryId, IReadOnlyList<Guid>? TagIds, bool IsImportant);
public sealed record UpdateNoteCommand(Guid Id, string Title, string Content, Guid? CategoryId, IReadOnlyList<Guid>? TagIds, bool IsImportant);
public sealed record CreateSavedLinkCommand(string Url, string Title, string? Description, Guid? CategoryId, IReadOnlyList<Guid>? TagIds, bool IsImportant);
public sealed record UpdateSavedLinkCommand(Guid Id, string Url, string Title, string? Description, Guid? CategoryId, IReadOnlyList<Guid>? TagIds, bool IsImportant);
public sealed record CreateCategoryCommand(string Name, string? ColorCode);
public sealed record CreateTagCommand(string Name);
public sealed record SearchVaultQuery(string? Keyword, Guid? CategoryId, Guid? TagId, bool? IsImportant);
