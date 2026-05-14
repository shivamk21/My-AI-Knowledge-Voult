using AiKnowledgeVault.Domain.Common;

namespace AiKnowledgeVault.Domain.Entities;

public sealed class User : BaseEntity
{
    public string ExternalId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
}
