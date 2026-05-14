using AiKnowledgeVault.Domain.Common;

namespace AiKnowledgeVault.Domain.Entities;

public sealed class NoteEmbedding : BaseEntity
{
    public Guid NoteId { get; set; }
    public Note Note { get; set; } = default!;
    public string Model { get; set; } = string.Empty;
    public float[] Vector { get; set; } = [];
}
