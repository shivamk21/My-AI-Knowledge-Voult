using AiKnowledgeVault.Domain.Common;

namespace AiKnowledgeVault.Domain.Entities;

public sealed class Note : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public bool IsImportant { get; set; }
    public Guid? CategoryId { get; set; }
    public Category? Category { get; set; }
    public ICollection<NoteTag> NoteTags { get; set; } = new List<NoteTag>();
    public NoteEmbedding? Embedding { get; set; }
}
