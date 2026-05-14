using AiKnowledgeVault.Application.DTOs;
using AiKnowledgeVault.Domain.Entities;

namespace AiKnowledgeVault.Application.Mapping;

public static class VaultMapping
{
    public static NoteDto ToDto(this Note note) => new(
        note.Id,
        note.Title,
        note.Content,
        note.IsImportant,
        note.CategoryId,
        note.Category?.Name,
        note.NoteTags.Select(nt => new TagDto(nt.Tag.Id, nt.Tag.Name)).OrderBy(t => t.Name).ToList(),
        note.CreatedAt,
        note.UpdatedAt);

    public static SavedLinkDto ToDto(this SavedLink link) => new(
        link.Id,
        link.Url,
        link.Title,
        link.Description,
        link.IsImportant,
        link.CategoryId,
        link.Category?.Name,
        link.SavedLinkTags.Select(lt => new TagDto(lt.Tag.Id, lt.Tag.Name)).OrderBy(t => t.Name).ToList(),
        link.CreatedAt,
        link.UpdatedAt);

    public static CategoryDto ToDto(this Category category) => new(category.Id, category.Name, category.ColorCode);
    public static TagDto ToDto(this Tag tag) => new(tag.Id, tag.Name);
}
