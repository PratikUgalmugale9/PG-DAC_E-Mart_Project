using EMart.Data;
using EMart.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace EMart.Services
{
    // Interface moved to Services/IOrderService.cs

    public class OrderService : IOrderService
    {
        private readonly EMartDbContext _context;
        private readonly ILoyaltycardService _loyaltycardService;

        public OrderService(EMartDbContext context, ILoyaltycardService loyaltycardService)
        {
            _context = context;
            _loyaltycardService = loyaltycardService;
        }

        public async Task<Ordermaster> PlaceOrderFromCartAsync(int userId, int? cartId, string paymentMode)
        {
            var user = await _context.Users
                .Include(u => u.Cart)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null) throw new Exception($"User not found with id: {userId}");

            if (cartId == null && user.Cart != null)
            {
                cartId = user.Cart.Id;
            }

            if (cartId == null) throw new Exception("Cart ID is missing and could not be resolved.");

            var cartItems = await _context.Cartitems
                .Include(ci => ci.Product)
                .Where(ci => ci.CartId == cartId)
                .ToListAsync();

            if (!cartItems.Any()) throw new Exception("Cart is empty. Cannot place order.");

            decimal totalAmount = 0;
            int totalPointsRequired = 0;

            foreach (var item in cartItems)
            {
                decimal price = item.PriceSnapshot;
                totalAmount += price * item.Quantity;

                if (item.Product?.PointsToBeRedeem != null && item.Product.PointsToBeRedeem > 0)
                {
                    totalPointsRequired += item.Product.PointsToBeRedeem.Value * item.Quantity;
                }
            }

            decimal amountPaidByPoints = 0;

            if ("LOYALTY".Equals(paymentMode, StringComparison.OrdinalIgnoreCase))
            {
                var card = await _loyaltycardService.GetLoyaltycardByUserIdAsync(userId);
                if (card == null) throw new Exception("Loyalty card not found");

                if ((card.PointsBalance ?? 0) < totalPointsRequired)
                {
                    throw new Exception($"Insufficient loyalty points. Required: {totalPointsRequired}, Available: {card.PointsBalance ?? 0}");
                }

                amountPaidByPoints = (decimal)totalPointsRequired;
                await _loyaltycardService.UpdatePointsAsync(userId, -totalPointsRequired);
            }

            decimal amountPaidByCash = totalAmount - amountPaidByPoints;

            if (amountPaidByCash <= 0)
            {
                throw new Exception("Points-only purchase is not allowed. Please pay some amount by cash.");
            }

            var ordermaster = new Ordermaster
            {
                UserId = userId,
                PaymentMode = paymentMode,
                OrderStatus = "Pending",
                TotalAmount = totalAmount,
                OrderDate = DateTime.UtcNow,
                Items = new List<OrderItem>()
            };

            _context.Ordermasters.Add(ordermaster);
            await _context.SaveChangesAsync();

            foreach (var cartItem in cartItems)
            {
                var orderItem = new OrderItem
                {
                    OrderId = ordermaster.Id,
                    ProductId = cartItem.ProductId,
                    Quantity = cartItem.Quantity,
                    Price = cartItem.PriceSnapshot
                };
                ordermaster.Items.Add(orderItem);
            }

            _context.OrderItems.AddRange(ordermaster.Items);
            _context.Cartitems.RemoveRange(cartItems);

            try
            {
                int pointsEarned = (int)(totalAmount * 0.10m);
                if (pointsEarned > 0)
                {
                    await _loyaltycardService.UpdatePointsAsync(userId, pointsEarned);
                }
            }
            catch (Exception ex)
            {
                // Do NOT rollback order for reward failure
                var msg = ex.InnerException?.Message ?? ex.Message;
                Console.WriteLine($"Loyalty points credit failed: {msg}");
            }

            await _context.SaveChangesAsync();
            return ordermaster;
        }

        public async Task<List<Ordermaster>> GetAllOrdersAsync()
        {
            return await _context.Ordermasters.Include(o => o.User).ToListAsync();
        }

        public async Task<Ordermaster?> GetOrderByIdAsync(int id)
        {
            return await _context.Ordermasters
                .Include(o => o.User)
                .Include(o => o.Items)
                .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(o => o.Id == id);
        }

        public async Task<List<Ordermaster>> GetOrdersByUserAsync(int userId)
        {
            return await _context.Ordermasters
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();
        }
    }
}
