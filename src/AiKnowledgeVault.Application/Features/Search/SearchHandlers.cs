using AiKnowledgeVault.Application.DTOs;
using AiKnowledgeVault.Application.Interfaces;

namespace AiKnowledgeVault.Application.Features.Search;

public sealed class SearchHandlers(IVaultSearchService searchService)
{
    public Task<SearchResultDto> SearchAsync(SearchVaultQuery query, CancellationToken cancellationToken) =>
        searchService.SearchVaultAsync(query, cancellationToken);
}
