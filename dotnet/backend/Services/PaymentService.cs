using EMart.Data;
using EMart.Models;
using EMart.DTOs;
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

        public PaymentService(EMartDbContext context, IEmailService emailService, IInvoicePdfService invoicePdfService)
        {
            _context = context;
            _emailService = emailService;
            _invoicePdfService = invoicePdfService;
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
                PaymentDate = DateTime.UtcNow
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            if ("SUCCESS".Equals(payment.PaymentStatus, StringComparison.OrdinalIgnoreCase))
            {
                var order = await _context.Ordermasters
                    .Include(o => o.User)
                    .Include(o => o.Items)
                    .ThenInclude(i => i.Product)
                    .FirstOrDefaultAsync(o => o.Id == dto.OrderId);

                if (order != null)
                {
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
            var saved = await _context.Payments
                .Include(p => p.User)
                .Include(p => p.Order)
                .FirstOrDefaultAsync(p => p.Id == payment.Id);

            return MapToDTO(saved!);
        }

        public async Task<List<PaymentResponseDTO>> GetAllPaymentsAsync()
        {
            var payments = await _context.Payments
                .Include(p => p.User)
                .Include(p => p.Order)
                .ToListAsync();
            return payments.Select(MapToDTO).ToList();
        }

        public async Task<PaymentResponseDTO?> GetPaymentByIdAsync(int id)
        {
            var payment = await _context.Payments
                .Include(p => p.User)
                .Include(p => p.Order)
                .FirstOrDefaultAsync(p => p.Id == id);
            return payment != null ? MapToDTO(payment) : null;
        }

        public async Task<List<PaymentResponseDTO>> GetPaymentsByUserAsync(int userId)
        {
            var payments = await _context.Payments
                .Include(p => p.User)
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
                UserEmail = p.User?.Email
            };
        }
    }
}
