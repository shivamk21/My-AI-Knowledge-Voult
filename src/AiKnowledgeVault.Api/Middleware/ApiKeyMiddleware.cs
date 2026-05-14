using Microsoft.AspNetCore.Mvc;

namespace AiKnowledgeVault.Api.Middleware;

public sealed class ApiKeyMiddleware(RequestDelegate next, IConfiguration configuration)
{
    private const string HeaderName = "X-Vault-Api-Key";

    public async Task InvokeAsync(HttpContext context)
    {
        var enabled = configuration.GetValue<bool>("TemporaryAccess:Enabled");
        if (!enabled || IsPublicPath(context.Request.Path))
        {
            await next(context);
            return;
        }

        var configuredKey = configuration["TemporaryAccess:ApiKey"];
        if (string.IsNullOrWhiteSpace(configuredKey))
        {
            await WriteProblemAsync(context, StatusCodes.Status500InternalServerError, "Access key is not configured.");
            return;
        }

        if (!context.Request.Headers.TryGetValue(HeaderName, out var providedKey) || providedKey != configuredKey)
        {
            await WriteProblemAsync(context, StatusCodes.Status401Unauthorized, "A valid vault access key is required.");
            return;
        }

        await next(context);
    }

    private static bool IsPublicPath(PathString path) =>
        path.StartsWithSegments("/health") ||
        path.StartsWithSegments("/swagger");

    private static async Task WriteProblemAsync(HttpContext context, int statusCode, string detail)
    {
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/problem+json";
        await context.Response.WriteAsJsonAsync(new ProblemDetails
        {
            Status = statusCode,
            Title = statusCode == StatusCodes.Status401Unauthorized ? "Unauthorized" : "Server error",
            Detail = detail,
            Instance = context.Request.Path
        });
    }
}
