using AiKnowledgeVault.Api.Middleware;
using AiKnowledgeVault.Application;
using AiKnowledgeVault.Application.Features.Links;
using AiKnowledgeVault.Application.Features.Notes;
using AiKnowledgeVault.Application.Features.Search;
using AiKnowledgeVault.Application.Features.Taxonomy;
using AiKnowledgeVault.Infrastructure;
using AiKnowledgeVault.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, configuration) =>
    configuration.ReadFrom.Configuration(context.Configuration));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        var origins = builder.Configuration.GetSection("AllowedCorsOrigins").Get<string[]>() ?? [];
        policy.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod();
    });
});

builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddScoped<NoteHandlers>();
builder.Services.AddScoped<SavedLinkHandlers>();
builder.Services.AddScoped<TaxonomyHandlers>();
builder.Services.AddScoped<SearchHandlers>();

var app = builder.Build();

app.UseMiddleware<GlobalExceptionMiddleware>();
app.UseSerilogRequestLogging();
app.UseCors("Frontend");
app.UseMiddleware<ApiKeyMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await dbContext.Database.MigrateAsync();
}

app.MapGet("/", () => Results.Ok(new { name = "AI Knowledge Vault API", status = "running" }));
app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));

var notes = app.MapGroup("/api/notes").WithTags("Notes");
notes.MapPost("/", async (CreateNoteCommand command, NoteHandlers handler, CancellationToken ct) =>
{
    var created = await handler.CreateAsync(command, ct);
    return Results.Created($"/api/notes/{created.Id}", created);
});
notes.MapGet("/", async (NoteHandlers handler, CancellationToken ct) => Results.Ok(await handler.GetAllAsync(ct)));
notes.MapGet("/{id:guid}", async (Guid id, NoteHandlers handler, CancellationToken ct) =>
    await handler.GetByIdAsync(id, ct) is { } note ? Results.Ok(note) : Results.NotFound());
notes.MapPut("/{id:guid}", async (Guid id, UpdateNoteRequest request, NoteHandlers handler, CancellationToken ct) =>
    await handler.UpdateAsync(new UpdateNoteCommand(id, request.Title, request.Content, request.CategoryId, request.TagIds, request.IsImportant), ct) is { } note
        ? Results.Ok(note)
        : Results.NotFound());
notes.MapDelete("/{id:guid}", async (Guid id, NoteHandlers handler, CancellationToken ct) =>
    await handler.DeleteAsync(id, ct) ? Results.NoContent() : Results.NotFound());
notes.MapGet("/search", async (string? keyword, Guid? categoryId, Guid? tagId, bool? isImportant, NoteHandlers handler, CancellationToken ct) =>
    Results.Ok(await handler.SearchAsync(new SearchVaultQuery(keyword, categoryId, tagId, isImportant), ct)));

var links = app.MapGroup("/api/links").WithTags("Saved Links");
links.MapPost("/", async (CreateSavedLinkCommand command, SavedLinkHandlers handler, CancellationToken ct) =>
{
    var created = await handler.CreateAsync(command, ct);
    return Results.Created($"/api/links/{created.Id}", created);
});
links.MapGet("/", async (SavedLinkHandlers handler, CancellationToken ct) => Results.Ok(await handler.GetAllAsync(ct)));
links.MapGet("/{id:guid}", async (Guid id, SavedLinkHandlers handler, CancellationToken ct) =>
    await handler.GetByIdAsync(id, ct) is { } link ? Results.Ok(link) : Results.NotFound());
links.MapPut("/{id:guid}", async (Guid id, UpdateSavedLinkRequest request, SavedLinkHandlers handler, CancellationToken ct) =>
    await handler.UpdateAsync(new UpdateSavedLinkCommand(id, request.Url, request.Title, request.Description, request.CategoryId, request.TagIds, request.IsImportant), ct) is { } link
        ? Results.Ok(link)
        : Results.NotFound());
links.MapDelete("/{id:guid}", async (Guid id, SavedLinkHandlers handler, CancellationToken ct) =>
    await handler.DeleteAsync(id, ct) ? Results.NoContent() : Results.NotFound());
links.MapGet("/search", async (string? keyword, Guid? categoryId, Guid? tagId, bool? isImportant, SavedLinkHandlers handler, CancellationToken ct) =>
    Results.Ok(await handler.SearchAsync(new SearchVaultQuery(keyword, categoryId, tagId, isImportant), ct)));

var categories = app.MapGroup("/api/categories").WithTags("Categories");
categories.MapPost("/", async (CreateCategoryCommand command, TaxonomyHandlers handler, CancellationToken ct) =>
    Results.Created("/api/categories", await handler.CreateCategoryAsync(command, ct)));
categories.MapGet("/", async (TaxonomyHandlers handler, CancellationToken ct) => Results.Ok(await handler.GetCategoriesAsync(ct)));

var tags = app.MapGroup("/api/tags").WithTags("Tags");
tags.MapPost("/", async (CreateTagCommand command, TaxonomyHandlers handler, CancellationToken ct) =>
    Results.Created("/api/tags", await handler.CreateTagAsync(command, ct)));
tags.MapGet("/", async (TaxonomyHandlers handler, CancellationToken ct) => Results.Ok(await handler.GetTagsAsync(ct)));

app.MapGet("/api/search", async (string? keyword, Guid? categoryId, Guid? tagId, bool? isImportant, SearchHandlers handler, CancellationToken ct) =>
    Results.Ok(await handler.SearchAsync(new SearchVaultQuery(keyword, categoryId, tagId, isImportant), ct))).WithTags("Search");

app.Run();

public sealed record UpdateNoteRequest(string Title, string Content, Guid? CategoryId, IReadOnlyList<Guid>? TagIds, bool IsImportant);
public sealed record UpdateSavedLinkRequest(string Url, string Title, string? Description, Guid? CategoryId, IReadOnlyList<Guid>? TagIds, bool IsImportant);
