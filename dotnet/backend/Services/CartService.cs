using EMart.Data;
using EMart.DTOs;
using EMart.Models;
using Microsoft.EntityFrameworkCore;

namespace EMart.Services
{
    public interface ICartService
    {
        Task<CartResponse> GetUserCartAsync(string email);
        Task<CartItemResponse> AddOrUpdateItemAsync(string email, CartItemRequest request);
        Task<bool> RemoveItemAsync(string email, int cartItemId);
        Task<CartItemResponse> UpdateQuantityAsync(string email, int cartItemId, int quantity);
    }

    public class CartService : ICartService
    {
        private readonly EMartDbContext _context;

        public CartService(EMartDbContext context)
        {
            _context = context;
        }

        private async Task<Cart> GetOrCreateCartAsync(string email)
        {
            var user = await _context.Users
                .Include(u => u.Cart)
                .FirstOrDefaultAsync(u => u.Email == email);

            if (user == null) throw new Exception("User not found");

            if (user.Cart == null)
            {
                var newCart = new Cart
                {
                    UserId = user.Id,
                    IsActive = 'Y'
                };
                _context.Carts.Add(newCart);
                await _context.SaveChangesAsync();
                return newCart;
            }

            return user.Cart;
        }

        public async Task<CartResponse> GetUserCartAsync(string email)
        {
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Product)
                .FirstOrDefaultAsync(c => c.User.Email == email);

            if (cart == null)
            {
                // Create cart if not exists
                cart = await GetOrCreateCartAsync(email);
            }

            var itemResponses = cart.CartItems.Select(MapToResponse).ToList();
            var total = itemResponses.Sum(i => i.TotalPrice);

            return new CartResponse(cart.Id, cart.IsActive, itemResponses, total);
        }

        public async Task<CartItemResponse> AddOrUpdateItemAsync(string email, CartItemRequest request)
        {
            var cart = await GetOrCreateCartAsync(email);
            var product = await _context.Products.FindAsync(request.ProductId);
            
            if (product == null) throw new Exception("Product not found");

            var cartItem = await _context.Cartitems
                .FirstOrDefaultAsync(ci => ci.CartId == cart.Id && ci.ProductId == request.ProductId);

            if (cartItem != null)
            {
                cartItem.Quantity += request.Quantity;
            }
            else
            {
                cartItem = new Cartitem
                {
                    CartId = cart.Id,
                    ProductId = request.ProductId,
                    Quantity = request.Quantity,
                    PriceSnapshot = product.MrpPrice ?? 0
                };
                _context.Cartitems.Add(cartItem);
            }

            await _context.SaveChangesAsync();
            
            // Reload to get navigation properties for the response
            await _context.Entry(cartItem).Reference(ci => ci.Product).LoadAsync();
            return MapToResponse(cartItem);
        }

        public async Task<bool> RemoveItemAsync(string email, int cartItemId)
        {
            var cartItem = await _context.Cartitems
                .Include(ci => ci.Cart)
                    .ThenInclude(c => c.User)
                .FirstOrDefaultAsync(ci => ci.Id == cartItemId);

            if (cartItem == null || cartItem.Cart.User.Email != email) return false;

            _context.Cartitems.Remove(cartItem);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<CartItemResponse> UpdateQuantityAsync(string email, int cartItemId, int quantity)
        {
            var cartItem = await _context.Cartitems
                .Include(ci => ci.Product)
                .Include(ci => ci.Cart)
                    .ThenInclude(c => c.User)
                .FirstOrDefaultAsync(ci => ci.Id == cartItemId);

            if (cartItem == null || cartItem.Cart.User.Email != email) 
                throw new Exception("Not authorized or item not found");

            if (quantity <= 0) throw new Exception("Quantity must be greater than 0");

            cartItem.Quantity = quantity;
            await _context.SaveChangesAsync();
            return MapToResponse(cartItem);
        }

        private CartItemResponse MapToResponse(Cartitem item)
        {
            return new CartItemResponse(
                item.Id,
                item.CartId,
                item.ProductId,
                item.Product?.ProdName ?? "Unknown Product",
                item.Product?.ProdImagePath,
                item.Quantity,
                item.PriceSnapshot,
                item.Product?.MrpPrice,
                item.Product?.CardholderPrice,
                item.Product?.PointsToBeRedeem,
                item.PriceSnapshot * item.Quantity
            );
        }
    }
}
