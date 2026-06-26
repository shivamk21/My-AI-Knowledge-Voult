using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AiKnowledgeVault.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSavedLinkImportMetadata : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SourceCategory",
                table: "SavedLinks",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SourceType",
                table: "SavedLinks",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_SavedLinks_SourceType",
                table: "SavedLinks",
                column: "SourceType");

            migrationBuilder.CreateIndex(
                name: "IX_SavedLinks_Url",
                table: "SavedLinks",
                column: "Url");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_SavedLinks_SourceType",
                table: "SavedLinks");

            migrationBuilder.DropIndex(
                name: "IX_SavedLinks_Url",
                table: "SavedLinks");

            migrationBuilder.DropColumn(
                name: "SourceCategory",
                table: "SavedLinks");

            migrationBuilder.DropColumn(
                name: "SourceType",
                table: "SavedLinks");
        }
    }
}
