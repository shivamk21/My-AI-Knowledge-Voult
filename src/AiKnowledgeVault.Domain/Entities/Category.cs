using AiKnowledgeVault.Domain.Common;

namespace AiKnowledgeVault.Domain.Entities;

public sealed class Category : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? ColorCode { get; set; }
    public ICollection<Note> Notes { get; set; } = new List<Note>();
    public ICollection<SavedLink> SavedLinks { get; set; } = new List<SavedLink>();
}
