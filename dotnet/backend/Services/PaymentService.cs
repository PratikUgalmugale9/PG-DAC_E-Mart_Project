using EMart.Data;
using EMart.DTOs;
using EMart.Models;
using Microsoft.EntityFrameworkCore;

namespace EMart.Services
{
    // IInvoicePdfService and InvoicePdfService moved to their own files/removed if duplicate.

    public interface IPaymentService
    {
        Task<PaymentResponseDTO> CreatePaymentAsync(PaymentRequestDTO dto);
        Task<List<PaymentResponseDTO>> GetAllPaymentsAsync();
        Task<PaymentResponseDTO?> GetPaymentByIdAsync(int id);
        Task<List<PaymentResponseDTO>> GetPaymentsByUserAsync(int userId);
    }

    public class PaymentService : IPaymentService
    {
        private readonly EMartDbContext _context;
        private readonly IEmailService _emailService;
        private readonly IInvoicePdfService _invoicePdfService;
        private readonly ILoyaltycardService _loyaltycardService;

        public PaymentService(
            EMartDbContext context,
            IEmailService emailService,
            IInvoicePdfService invoicePdfService,
            ILoyaltycardService loyaltycardService
        )
        {
            _context = context;
            _emailService = emailService;
            _invoicePdfService = invoicePdfService;
            _loyaltycardService = loyaltycardService;
        }

        public async Task<PaymentResponseDTO> CreatePaymentAsync(PaymentRequestDTO dto)
        {
            var payment = new Payment
            {
                OrderId = dto.OrderId,
                UserId = dto.UserId,
                AmountPaid = dto.AmountPaid,
                PaymentMode = dto.PaymentMode,
                PaymentStatus = dto.PaymentStatus ?? "initiated",
                TransactionId = dto.TransactionId,
                PaymentDate = DateTime.UtcNow,
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            if ("SUCCESS".Equals(payment.PaymentStatus, StringComparison.OrdinalIgnoreCase))
            {
                var order = await _context
                    .Ordermasters.Include(o => o.User)
                    .Include(o => o.Items)
                        .ThenInclude(i => i.Product)
                    .FirstOrDefaultAsync(o => o.Id == dto.OrderId);

                if (order != null)
                {
                    // 1. DEDUCT POINTS
                    int totalPointsUsed = order.Items.Sum(i => i.PointsUsed);
                    if (totalPointsUsed > 0)
                    {
                        try
                        {
                            await _loyaltycardService.UpdatePointsAsync(
                                payment.UserId,
                                -totalPointsUsed
                            );
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"Failed to deduct points: {ex.Message}");
                        }
                    }

                    // 2. AWARD POINTS (10% of total product price, excluding delivery)
                    // ONLY award points if user has an active loyalty card
                    var loyaltyCard = await _loyaltycardService.GetLoyaltycardByUserIdAsync(payment.UserId);
                    
                    if (loyaltyCard != null && (loyaltyCard.IsActive == 'Y' || loyaltyCard.IsActive == 'y'))
                    {
                        // Calculate points ONLY on cash-paid items (exclude POINTS items)
                        decimal cashPaidAmount = order.Items
                            .Where(i => i.PriceType != "POINTS")
                            .Sum(i => i.Price * i.Quantity);
                        
                        int pointsEarned = (int)(cashPaidAmount * 0.10m);

                        if (pointsEarned > 0)
                        {
                            try
                            {
                                await _loyaltycardService.UpdatePointsAsync(
                                    payment.UserId,
                                    pointsEarned
                                );
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine($"Failed to award points: {ex.Message}");
                            }
                        }
                    }

                    // 3. CLEAR CART
                    // Clear all items in the user's cart
                    var userCartItems = await _context
                        .Cartitems.Include(ci => ci.Cart)
                        .Where(ci => ci.Cart.UserId == payment.UserId)
                        .ToListAsync();

                    if (userCartItems.Any())
                    {
                        _context.Cartitems.RemoveRange(userCartItems);
                        await _context.SaveChangesAsync();
                    }

                    // 4. GENERATE INVOICE & EMAIL
                    var items = order.Items.ToList();
                    var invoicePdf = _invoicePdfService.GenerateInvoicePdf(order, items);

                    try
                    {
                        await _emailService.SendPaymentSuccessMailAsync(order, invoicePdf);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Email failure: {ex.Message}");
                    }
                }
            }

            // Reload to get navigation properties for mapping
            var saved = await _context
                .Payments.Include(p => p.User)
                .Include(p => p.Order)
                .FirstOrDefaultAsync(p => p.Id == payment.Id);

            return MapToDTO(saved!);
        }

        public async Task<List<PaymentResponseDTO>> GetAllPaymentsAsync()
        {
            var payments = await _context
                .Payments.Include(p => p.User)
                .Include(p => p.Order)
                .ToListAsync();
            return payments.Select(MapToDTO).ToList();
        }

        public async Task<PaymentResponseDTO?> GetPaymentByIdAsync(int id)
        {
            var payment = await _context
                .Payments.Include(p => p.User)
                .Include(p => p.Order)
                .FirstOrDefaultAsync(p => p.Id == id);
            return payment != null ? MapToDTO(payment) : null;
        }

        public async Task<List<PaymentResponseDTO>> GetPaymentsByUserAsync(int userId)
        {
            var payments = await _context
                .Payments.Include(p => p.User)
                .Include(p => p.Order)
                .Where(p => p.UserId == userId)
                .ToListAsync();
            return payments.Select(MapToDTO).ToList();
        }

        private PaymentResponseDTO MapToDTO(Payment p)
        {
            return new PaymentResponseDTO
            {
                PaymentId = p.Id,
                AmountPaid = p.AmountPaid,
                PaymentMode = p.PaymentMode ?? "",
                PaymentStatus = p.PaymentStatus,
                TransactionId = p.TransactionId,
                PaymentDate = p.PaymentDate,
                OrderId = p.OrderId,
                UserId = p.UserId,
                UserName = p.User?.FullName,
                UserEmail = p.User?.Email,
            };
        }
    }
}
