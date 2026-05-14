using AiKnowledgeVault.Application.DTOs;
using AiKnowledgeVault.Application.Interfaces;
using AiKnowledgeVault.Application.Mapping;
using AiKnowledgeVault.Application.Validation;
using AiKnowledgeVault.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AiKnowledgeVault.Application.Features.Taxonomy;

public sealed class TaxonomyHandlers(IUnitOfWork unitOfWork)
{
    public async Task<CategoryDto> CreateCategoryAsync(CreateCategoryCommand command, CancellationToken cancellationToken)
    {
        var category = new Category
        {
            Name = Ensure.Required(command.Name, "Name", 100),
            ColorCode = Ensure.Optional(command.ColorCode, 32)
        };

        await unitOfWork.Categories.AddAsync(category, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return category.ToDto();
    }

    public async Task<IReadOnlyList<CategoryDto>> GetCategoriesAsync(CancellationToken cancellationToken)
    {
        var categories = await unitOfWork.Categories.Query()
            .Where(c => !c.IsDeleted)
            .OrderBy(c => c.Name)
            .ToListAsync(cancellationToken);
        return categories.Select(c => c.ToDto()).ToList();
    }

    public async Task<TagDto> CreateTagAsync(CreateTagCommand command, CancellationToken cancellationToken)
    {
        var tag = new Tag { Name = Ensure.Required(command.Name, "Name", 100) };
        await unitOfWork.Tags.AddAsync(tag, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return tag.ToDto();
    }

    public async Task<IReadOnlyList<TagDto>> GetTagsAsync(CancellationToken cancellationToken)
    {
        var tags = await unitOfWork.Tags.Query()
            .Where(t => !t.IsDeleted)
            .OrderBy(t => t.Name)
            .ToListAsync(cancellationToken);
        return tags.Select(t => t.ToDto()).ToList();
    }
}
