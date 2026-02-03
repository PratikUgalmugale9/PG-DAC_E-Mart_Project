namespace EMart.DTOs
{
    public record CartItemRequest(int ProductId, int Quantity);

    public record CartItemResponse(
        int CartItemId,
        int CartId,
        int ProductId,
        string ProductName,
        string? ProdImagePath,
        int Quantity,
        decimal PriceSnapshot,
        decimal? MrpPrice,
        decimal? CardholderPrice,
        int? PointsToBeRedeem,
        decimal TotalPrice
    );

    public record CartResponse(
        int CartId,
        char IsActive,
        List<CartItemResponse> Items,
        decimal GrantTotal
    );
}
