using AiKnowledgeVault.Domain.Common;
using AiKnowledgeVault.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AiKnowledgeVault.Infrastructure.Persistence;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Note> Notes => Set<Note>();
    public DbSet<SavedLink> SavedLinks => Set<SavedLink>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<NoteTag> NoteTags => Set<NoteTag>();
    public DbSet<SavedLinkTag> SavedLinkTags => Set<SavedLinkTag>();
    public DbSet<NoteEmbedding> NoteEmbeddings => Set<NoteEmbedding>();

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity>().Where(e => e.State == EntityState.Modified))
        {
            entry.Entity.UpdatedAt = DateTimeOffset.UtcNow;
        }

        return base.SaveChangesAsync(cancellationToken);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Category>(entity =>
        {
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.ColorCode).HasMaxLength(32);
            entity.HasIndex(e => e.Name);
        });

        modelBuilder.Entity<Tag>(entity =>
        {
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.HasIndex(e => e.Name).IsUnique();
        });

        modelBuilder.Entity<Note>(entity =>
        {
            entity.Property(e => e.Title).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Content).HasMaxLength(8000).IsRequired();
            entity.HasIndex(e => e.Title);
            entity.HasIndex(e => e.CategoryId);
            entity.HasOne(e => e.Category).WithMany(c => c.Notes).HasForeignKey(e => e.CategoryId).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<SavedLink>(entity =>
        {
            entity.Property(e => e.Url).HasMaxLength(1000).IsRequired();
            entity.Property(e => e.Title).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(2000);
            entity.HasIndex(e => e.Title);
            entity.HasIndex(e => e.CategoryId);
            entity.HasOne(e => e.Category).WithMany(c => c.SavedLinks).HasForeignKey(e => e.CategoryId).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<NoteTag>(entity =>
        {
            entity.HasKey(e => new { e.NoteId, e.TagId });
            entity.HasOne(e => e.Note).WithMany(n => n.NoteTags).HasForeignKey(e => e.NoteId);
            entity.HasOne(e => e.Tag).WithMany(t => t.NoteTags).HasForeignKey(e => e.TagId);
        });

        modelBuilder.Entity<SavedLinkTag>(entity =>
        {
            entity.HasKey(e => new { e.SavedLinkId, e.TagId });
            entity.HasOne(e => e.SavedLink).WithMany(l => l.SavedLinkTags).HasForeignKey(e => e.SavedLinkId);
            entity.HasOne(e => e.Tag).WithMany(t => t.SavedLinkTags).HasForeignKey(e => e.TagId);
        });

        modelBuilder.Entity<NoteEmbedding>(entity =>
        {
            entity.Property(e => e.Model).HasMaxLength(100).IsRequired();
            entity.HasOne(e => e.Note).WithOne(n => n.Embedding).HasForeignKey<NoteEmbedding>(e => e.NoteId);
            // Future AI semantic search: replace float[] storage with pgvector when embeddings are generated.
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.Property(e => e.ExternalId).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Email).HasMaxLength(320).IsRequired();
            entity.Property(e => e.FullName).HasMaxLength(200).IsRequired();
            entity.HasIndex(e => e.ExternalId).IsUnique();
        });
    }
}
