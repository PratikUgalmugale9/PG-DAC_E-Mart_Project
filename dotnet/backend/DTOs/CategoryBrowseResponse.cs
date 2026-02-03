namespace EMart.DTOs
{

public class CategoryBrowseResponse
{
    public bool HasSubCategories { get; set; }
    public List<CategoryDto>? SubCategories { get; set; }
    public List<ProductDto>? Products { get; set; }
}
}
