namespace EMart.DTOs
{
    public record CategoryDto(
        int Id,
        string CatId,
        string? SubcatId,
        string CatName,
        string? CatImagePath,
        char? Flag
    );

    public record ProductDto(
        int Id,
        string ProdName,
        string? ProdImagePath,
        string? ProdShortDesc,
        string? ProdLongDesc,
        decimal? MrpPrice,
        decimal? CardholderPrice,
        int? PointsToBeRedeem,
        int CategoryId
    );
}
