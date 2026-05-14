namespace AiKnowledgeVault.Domain.Entities;

public sealed class SavedLinkTag
{
    public Guid SavedLinkId { get; set; }
    public SavedLink SavedLink { get; set; } = default!;
    public Guid TagId { get; set; }
    public Tag Tag { get; set; } = default!;
}
