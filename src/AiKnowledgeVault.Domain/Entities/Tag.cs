using AiKnowledgeVault.Domain.Common;

namespace AiKnowledgeVault.Domain.Entities;

public sealed class Tag : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public ICollection<NoteTag> NoteTags { get; set; } = new List<NoteTag>();
    public ICollection<SavedLinkTag> SavedLinkTags { get; set; } = new List<SavedLinkTag>();
}
