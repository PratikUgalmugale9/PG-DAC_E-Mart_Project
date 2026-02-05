using System.Security.Claims;
using EMart.Data;
using EMart.Models;
using Microsoft.EntityFrameworkCore;

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

        public async Task<Ordermaster> PlaceOrderFromCartAsync(
            int userId,
            int? cartId,
            string paymentMode
        )
        {
            var user = await _context
                .Users.Include(u => u.Cart)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                throw new Exception($"User not found with id: {userId}");

            if (cartId == null && user.Cart != null)
            {
                cartId = user.Cart.Id;
            }

            if (cartId == null)
                throw new Exception("Cart ID is missing and could not be resolved.");

            var cartItems = await _context
                .Cartitems.Include(ci => ci.Product)
                .Where(ci => ci.CartId == cartId)
                .ToListAsync();

            if (!cartItems.Any())
                throw new Exception("Cart is empty. Cannot place order.");

            // ========================================
            // VALIDATION 1: Loyalty Card Status Check
            // ========================================
            bool hasNonMrpItems = cartItems.Any(ci => ci.PriceType != "MRP");
            Loyaltycard? loyaltyCard = null;

            if (hasNonMrpItems)
            {
                loyaltyCard = await _loyaltycardService.GetLoyaltycardByUserIdAsync(userId);
                if (loyaltyCard == null)
                {
                    throw new Exception(
                        "Loyalty card required for non-MRP pricing. Please use MRP pricing or obtain a loyalty card."
                    );
                }
                if (loyaltyCard.IsActive != 'Y' && loyaltyCard.IsActive != 'y')
                {
                    throw new Exception(
                        "Your loyalty card is inactive. Please contact support or use MRP pricing."
                    );
                }
            }

            // ========================================
            // VALIDATION 2: Product Eligibility Check
            // ========================================
            foreach (var item in cartItems)
            {
                if (item.PriceType == "LOYALTY")
                {
                    if (item.Product?.CardholderPrice == null)
                    {
                        throw new Exception(
                            $"Product '{item.Product?.ProdName}' is not eligible for cardholder pricing."
                        );
                    }
                }
                else if (item.PriceType == "POINTS")
                {
                    if (
                        item.Product?.PointsToBeRedeem == null
                        || item.Product.PointsToBeRedeem <= 0
                    )
                    {
                        throw new Exception(
                            $"Product '{item.Product?.ProdName}' cannot be purchased with points."
                        );
                    }
                }
            }

            // ========================================
            // VALIDATION 3: Verify Pricing Rules
            // ========================================
            foreach (var item in cartItems)
            {
                decimal expectedPrice;
                if (item.PriceType == "MRP")
                {
                    expectedPrice = item.Product?.MrpPrice ?? 0;
                }
                else if (item.PriceType == "LOYALTY")
                {
                    expectedPrice = item.Product?.CardholderPrice ?? 0;
                }
                else // POINTS
                {
                    expectedPrice = item.Product?.MrpPrice ?? 0;
                }

                // Allow small rounding differences
                if (Math.Abs(item.PriceSnapshot - expectedPrice) > 0.01m)
                {
                    throw new Exception(
                        $"Price mismatch for '{item.Product?.ProdName}'. Expected: {expectedPrice}, Stored: {item.PriceSnapshot}. Please refresh cart."
                    );
                }
            }

            // ========================================
            // VALIDATION 4: Points Sufficiency Check
            // ========================================
            int totalPointsUsed = cartItems.Sum(ci => ci.PointsUsed);

            if (totalPointsUsed > 0)
            {
                if (loyaltyCard == null)
                {
                    loyaltyCard = await _loyaltycardService.GetLoyaltycardByUserIdAsync(userId);
                }

                if (loyaltyCard == null || (loyaltyCard.PointsBalance ?? 0) < totalPointsUsed)
                {
                    throw new Exception(
                        $"Insufficient loyalty points. Required: {totalPointsUsed}, Available: {loyaltyCard?.PointsBalance ?? 0}"
                    );
                }
            }

            // ========================================
            // CALCULATE TOTALS
            // ========================================
            decimal totalAmount = cartItems.Sum(ci => ci.PriceSnapshot * ci.Quantity);

            // For POINTS items, the price is technically "paid" via points
            decimal amountPaidByPoints = cartItems
                .Where(ci => ci.PriceType == "POINTS")
                .Sum(ci => ci.PriceSnapshot * ci.Quantity);

            decimal amountPaidByCash = totalAmount - amountPaidByPoints;

            // ========================================
            // CREATE ORDER
            // ========================================
            var ordermaster = new Ordermaster
            {
                UserId = userId,
                PaymentMode = paymentMode,
                OrderStatus = "Pending",
                TotalAmount = totalAmount,
                OrderDate = DateTime.UtcNow,
                Items = new List<OrderItem>(),
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
                    Price = cartItem.PriceSnapshot,
                    PointsUsed = cartItem.PointsUsed, // Persist points usage
                    PriceType = cartItem.PriceType     // Persist price mode
                };
                ordermaster.Items.Add(orderItem);
            }

            _context.OrderItems.AddRange(ordermaster.Items);

            // ========================================
            // NOTE: Points Deduction and Cart Clearing moved to PaymentService
            // to support payment failure scenarios (retain cart if failed).
            // ========================================

            /* MOVED TO PAYMENT SERVICE
            // ========================================
            // DEDUCT POINTS
            // ========================================
            if (totalPointsUsed > 0 && loyaltyCard != null)
            {
                await _loyaltycardService.UpdatePointsAsync(userId, -totalPointsUsed);
            }

            // Clear cart items
            _context.Cartitems.RemoveRange(cartItems);

            // ========================================
            // AWARD POINTS (10% of cash amount)
            // ========================================
            try
            {
                int pointsEarned = (int)(amountPaidByCash * 0.10m);
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
            */

            await _context.SaveChangesAsync();
            return ordermaster;
        }

        public async Task<List<Ordermaster>> GetAllOrdersAsync()
        {
            return await _context.Ordermasters.Include(o => o.User).ToListAsync();
        }

        public async Task<Ordermaster?> GetOrderByIdAsync(int id)
        {
            return await _context
                .Ordermasters.Include(o => o.User)
                .Include(o => o.Items)
                    .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(o => o.Id == id);
        }

        public async Task<List<Ordermaster>> GetOrdersByUserAsync(int userId)
        {
            return await _context
                .Ordermasters.Where(o => o.UserId == userId)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();
        }
    }
}
