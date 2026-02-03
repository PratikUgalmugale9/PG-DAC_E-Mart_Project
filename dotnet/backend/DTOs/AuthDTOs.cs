namespace EMart.DTOs
{
    public record LoginRequest(string Email, string Password);

    public record RegisterRequest(
        string FullName,
        string Email,
        string Password,
        string? Mobile,
        string? Address
    );

    public record AuthResponse(
        int Id,
        string FullName,
        string Email,
        string Token,
        string Provider
    );
}
