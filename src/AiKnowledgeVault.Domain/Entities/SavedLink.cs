using AiKnowledgeVault.Domain.Common;

namespace AiKnowledgeVault.Domain.Entities;

public sealed class SavedLink : BaseEntity
{
    public string Url { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsImportant { get; set; }
    public Guid? CategoryId { get; set; }
    public Category? Category { get; set; }
    public ICollection<SavedLinkTag> SavedLinkTags { get; set; } = new List<SavedLinkTag>();
}
