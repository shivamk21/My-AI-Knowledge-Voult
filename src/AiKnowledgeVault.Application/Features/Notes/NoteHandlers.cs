using AiKnowledgeVault.Application.DTOs;
using AiKnowledgeVault.Application.Interfaces;
using AiKnowledgeVault.Application.Mapping;
using AiKnowledgeVault.Application.Validation;
using AiKnowledgeVault.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AiKnowledgeVault.Application.Features.Notes;

public sealed class NoteHandlers(IUnitOfWork unitOfWork, IVaultSearchService searchService)
{
    public async Task<NoteDto> CreateAsync(CreateNoteCommand command, CancellationToken cancellationToken)
    {
        var note = new Note
        {
            Title = Ensure.Required(command.Title, "Title", 200),
            Content = Ensure.Required(command.Content, "Content", 8000),
            CategoryId = command.CategoryId,
            IsImportant = command.IsImportant
        };

        await SetTagsAsync(note, command.TagIds, cancellationToken);
        await unitOfWork.Notes.AddAsync(note, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return (await GetByIdAsync(note.Id, cancellationToken))!;
    }

    public async Task<IReadOnlyList<NoteDto>> GetAllAsync(CancellationToken cancellationToken) =>
        await searchService.SearchNotesAsync(new SearchVaultQuery(null, null, null, null), cancellationToken);

    public async Task<NoteDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var note = await unitOfWork.Notes.Query()
            .Include(n => n.Category)
            .Include(n => n.NoteTags).ThenInclude(nt => nt.Tag)
            .FirstOrDefaultAsync(n => n.Id == id && !n.IsDeleted, cancellationToken);

        return note?.ToDto();
    }

    public async Task<NoteDto?> UpdateAsync(UpdateNoteCommand command, CancellationToken cancellationToken)
    {
        var note = await unitOfWork.Notes.Query()
            .Include(n => n.NoteTags)
            .FirstOrDefaultAsync(n => n.Id == command.Id && !n.IsDeleted, cancellationToken);

        if (note is null)
        {
            return null;
        }

        note.Title = Ensure.Required(command.Title, "Title", 200);
        note.Content = Ensure.Required(command.Content, "Content", 8000);
        note.CategoryId = command.CategoryId;
        note.IsImportant = command.IsImportant;
        note.UpdatedAt = DateTimeOffset.UtcNow;
        await SetTagsAsync(note, command.TagIds, cancellationToken);
        unitOfWork.Notes.Update(note);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return await GetByIdAsync(note.Id, cancellationToken);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var note = await unitOfWork.Notes.GetByIdAsync(id, cancellationToken);
        if (note is null)
        {
            return false;
        }

        unitOfWork.Notes.Delete(note);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    public Task<IReadOnlyList<NoteDto>> SearchAsync(SearchVaultQuery query, CancellationToken cancellationToken) =>
        searchService.SearchNotesAsync(query, cancellationToken);

    private async Task SetTagsAsync(Note note, IReadOnlyList<Guid>? tagIds, CancellationToken cancellationToken)
    {
        note.NoteTags.Clear();
        foreach (var tagId in tagIds?.Distinct() ?? [])
        {
            var tagExists = await unitOfWork.Tags.Query().AnyAsync(t => t.Id == tagId && !t.IsDeleted, cancellationToken);
            if (!tagExists)
            {
                throw new ValidationException($"Tag '{tagId}' does not exist.");
            }

            note.NoteTags.Add(new NoteTag { NoteId = note.Id, TagId = tagId });
        }
    }
}
