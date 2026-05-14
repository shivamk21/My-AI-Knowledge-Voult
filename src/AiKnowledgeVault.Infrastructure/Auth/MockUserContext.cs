using AiKnowledgeVault.Application.Interfaces;

namespace AiKnowledgeVault.Infrastructure.Auth;

public sealed class MockUserContext : IUserContext
{
    public string? UserId => "mvp-user";
}
