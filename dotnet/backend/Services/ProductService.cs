using EMart.Data;
using EMart.DTOs;
using Microsoft.EntityFrameworkCore;

namespace EMart.Services
{
    public interface IProductService
    {
        Task<IEnumerable<ProductDto>> GetAllProductsAsync();
        Task<ProductDto?> GetProductByIdAsync(int id);
        Task<IEnumerable<ProductDto>> GetProductsByCategoryAsync(int categoryId);
    }

    public class ProductService : IProductService
    {
        private readonly EMartDbContext _context;

        public ProductService(EMartDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ProductDto>> GetAllProductsAsync()
        {
            return await _context.Products
                .Select(p => new ProductDto(p.Id, p.ProdName, p.ProdImagePath, p.ProdShortDesc, p.ProdLongDesc, p.MrpPrice, p.CardholderPrice, p.PointsToBeRedeem, p.CategoryId))
                .ToListAsync();
        }

        public async Task<ProductDto?> GetProductByIdAsync(int id)
        {
            var p = await _context.Products.FindAsync(id);
            if (p == null) return null;
            return new ProductDto(p.Id, p.ProdName, p.ProdImagePath, p.ProdShortDesc, p.ProdLongDesc, p.MrpPrice, p.CardholderPrice, p.PointsToBeRedeem, p.CategoryId);
        }

        public async Task<IEnumerable<ProductDto>> GetProductsByCategoryAsync(int categoryId)
        {
            return await _context.Products
                .Where(p => p.CategoryId == categoryId)
                .Select(p => new ProductDto(p.Id, p.ProdName, p.ProdImagePath, p.ProdShortDesc, p.ProdLongDesc, p.MrpPrice, p.CardholderPrice, p.PointsToBeRedeem, p.CategoryId))
                .ToListAsync();
        }
    }
}
