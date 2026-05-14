using AiKnowledgeVault.Application.DTOs;

namespace AiKnowledgeVault.Application.Interfaces;

public interface IVaultSearchService
{
    Task<IReadOnlyList<NoteDto>> SearchNotesAsync(SearchVaultQuery query, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SavedLinkDto>> SearchLinksAsync(SearchVaultQuery query, CancellationToken cancellationToken = default);
    Task<SearchResultDto> SearchVaultAsync(SearchVaultQuery query, CancellationToken cancellationToken = default);
}
