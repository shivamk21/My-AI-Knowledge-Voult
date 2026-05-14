namespace AiKnowledgeVault.Domain.Entities;

public sealed class NoteTag
{
    public Guid NoteId { get; set; }
    public Note Note { get; set; } = default!;
    public Guid TagId { get; set; }
    public Tag Tag { get; set; } = default!;
}
