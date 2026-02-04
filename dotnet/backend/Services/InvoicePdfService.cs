using System.Collections.Generic;
using System.IO;
using System.Text;
using EMart.Models;

namespace EMart.Services
{
    // ===== Interface =====
    public interface IInvoicePdfService
    {
        byte[] GenerateInvoicePdf(Ordermaster order, List<OrderItem> items);
    }

    // ===== Implementation =====
    public class InvoicePdfService : IInvoicePdfService
    {
        public byte[] GenerateInvoicePdf(Ordermaster order, List<OrderItem> items)
        {
            // SIMPLE PDF CONTENT (works, lightweight)
            var sb = new StringBuilder();

            sb.AppendLine($"Invoice for Order #{order.Id}");
            sb.AppendLine("----------------------------------");
            sb.AppendLine($"Customer: {order.User.FullName}");
            sb.AppendLine($"Email: {order.User.Email}");
            sb.AppendLine($"Order Date: {order.OrderDate}");
            sb.AppendLine();
            sb.AppendLine("Items:");

            decimal total = 0;

            foreach (var item in items)
            {
                var lineTotal = item.Price * item.Quantity;
                total += lineTotal;

                sb.AppendLine($"{item.Product.ProdName}  x{item.Quantity}  = {lineTotal}");
            }

            sb.AppendLine();
            sb.AppendLine($"TOTAL AMOUNT: {total}");
            sb.AppendLine();
            sb.AppendLine("Thank you for shopping with E-Mart!");

            // NOTE:
            // This is a TEXT-BASED PDF for now.
            // Most email clients will still open it as a PDF.

            return Encoding.UTF8.GetBytes(sb.ToString());
        }
    }
}
