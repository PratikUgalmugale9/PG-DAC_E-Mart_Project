using System;
using System.Collections.Generic;
using System.IO;
using EMart.Models;
using iTextSharp.text;
using iTextSharp.text.pdf;

namespace EMart.Services
{
    public interface IInvoicePdfService
    {
        byte[] GenerateInvoicePdf(Ordermaster order, List<OrderItem> items);
    }

    public class InvoicePdfService : IInvoicePdfService
    {
        public byte[] GenerateInvoicePdf(Ordermaster order, List<OrderItem> items)
        {
            if (order == null) throw new ArgumentNullException(nameof(order));
            if (items == null) throw new ArgumentNullException(nameof(items));

            using (MemoryStream ms = new MemoryStream())
            {
                Document document = new Document(PageSize.A4, 40, 40, 40, 40);
                PdfWriter.GetInstance(document, ms);
                document.Open();

                // Colors (Premium Charcoal & Slate)
                BaseColor primaryColor = new BaseColor(44, 62, 80); // Charcoal
                BaseColor secondaryColor = new BaseColor(127, 140, 141); // Slate Gray
                BaseColor borderColor = new BaseColor(200, 200, 200);

                // Fonts
                Font titleFont = FontFactory.GetFont("Helvetica", 24, Font.BOLD, primaryColor);
                Font headerFont = FontFactory.GetFont("Helvetica", 10, Font.BOLD, BaseColor.White);
                Font normalFont = FontFactory.GetFont("Helvetica", 10, Font.NORMAL, primaryColor);
                Font boldFont = FontFactory.GetFont("Helvetica", 10, Font.BOLD, primaryColor);
                Font smallFont = FontFactory.GetFont("Helvetica", 9, Font.NORMAL, secondaryColor);
                Font italicFont = FontFactory.GetFont("Helvetica", 9, Font.ITALIC, secondaryColor);
                Font totalAmountFont = FontFactory.GetFont("Helvetica", 13, Font.BOLD, primaryColor);

                // 1) HEADER / LOGO
                PdfPTable headerTable = new PdfPTable(2);
                headerTable.WidthPercentage = 100;
                headerTable.SetWidths(new float[] { 50, 50 });

                PdfPCell logoCell = new PdfPCell(new Phrase("e-MART", titleFont));
                logoCell.Border = Rectangle.NO_BORDER;
                logoCell.VerticalAlignment = Element.ALIGN_BOTTOM;
                headerTable.AddCell(logoCell);

                PdfPCell infoCell = new PdfPCell();
                infoCell.Border = Rectangle.NO_BORDER;
                infoCell.HorizontalAlignment = Element.ALIGN_RIGHT;
                Paragraph pHeader = new Paragraph("PREMIUM ONLINE SHOPPING", smallFont);
                pHeader.Alignment = Element.ALIGN_RIGHT;
                infoCell.AddElement(pHeader);
                Paragraph pInv = new Paragraph("TAX INVOICE", FontFactory.GetFont("Helvetica", 16, Font.BOLD, primaryColor));
                pInv.Alignment = Element.ALIGN_RIGHT;
                infoCell.AddElement(pInv);
                headerTable.AddCell(infoCell);

                document.Add(headerTable);
                document.Add(new Paragraph(new Chunk(new iTextSharp.text.pdf.draw.LineSeparator(1f, 100, secondaryColor, Element.ALIGN_CENTER, -2))));
                document.Add(new Paragraph(" "));

                // 2) CUSTOMER & ORDER DETAILS
                PdfPTable detailsTable = new PdfPTable(2);
                detailsTable.WidthPercentage = 100;
                detailsTable.SetWidths(new float[] { 60, 40 });

                // Bill To
                PdfPCell billToCell = new PdfPCell();
                billToCell.Border = Rectangle.NO_BORDER;
                billToCell.PaddingTop = 10;
                billToCell.AddElement(new Paragraph("BILL TO", FontFactory.GetFont("Helvetica", 9, Font.BOLD, secondaryColor)));
                billToCell.AddElement(new Paragraph(order.User?.FullName ?? "N/A", boldFont));
                billToCell.AddElement(new Paragraph(order.User?.Address ?? "Address not provided", normalFont));
                detailsTable.AddCell(billToCell);

                // Order Info
                PdfPCell orderInfoCell = new PdfPCell();
                orderInfoCell.Border = Rectangle.NO_BORDER;
                orderInfoCell.HorizontalAlignment = Element.ALIGN_RIGHT;
                orderInfoCell.PaddingTop = 10;
                
                PdfPTable innerOrderTable = new PdfPTable(2);
                innerOrderTable.WidthPercentage = 100;
                innerOrderTable.SetWidths(new float[] { 50, 50 });
                
                AddOrderInfo(innerOrderTable, "Invoice Number:", $"INV-{order.Id}", smallFont, boldFont, primaryColor);
                AddOrderInfo(innerOrderTable, "Date:", order.OrderDate?.ToString("dd-MMM-yyyy") ?? "N/A", smallFont, normalFont, primaryColor);
                AddOrderInfo(innerOrderTable, "Payment Mode:", order.PaymentMode ?? "N/A", smallFont, normalFont, primaryColor);

                orderInfoCell.AddElement(innerOrderTable);
                detailsTable.AddCell(orderInfoCell);

                document.Add(detailsTable);
                document.Add(new Paragraph(" "));

                // 3) ITEMS TABLE
                PdfPTable itemTable = new PdfPTable(6);
                itemTable.WidthPercentage = 100;
                itemTable.SetWidths(new float[] { 10, 42, 8, 13, 13, 14 });
                itemTable.HeaderRows = 1;

                string[] headers = { "SKU", "ITEM DESCRIPTION", "QTY", "LIST PRICE", "OUR PRICE", "TOTAL" };
                foreach (var h in headers)
                {
                    PdfPCell cell = new PdfPCell(new Phrase(h, headerFont));
                    cell.BackgroundColor = primaryColor;
                    cell.HorizontalAlignment = Element.ALIGN_CENTER;
                    cell.VerticalAlignment = Element.ALIGN_MIDDLE;
                    cell.Border = Rectangle.NO_BORDER;
                    cell.Padding = 10;
                    itemTable.AddCell(cell);
                }

                decimal productTotal = 0;
                int totalPointsRedeemed = 0;

                foreach (var item in items)
                {
                    var p = item.Product;
                    if (p == null) continue;

                    var listPrice = p.MrpPrice ?? 0;
                    var ourPrice = item.Price; // Use actual price from OrderItem (handles MRP vs Cardholder selection)
                    var qty = item.Quantity;
                    var amount = ourPrice * qty;

                    productTotal += amount;
                    totalPointsRedeemed += item.PointsUsed;

                    itemTable.AddCell(CreateItemCell($"P{p.Id}", normalFont, Element.ALIGN_CENTER, borderColor));

                    // Description with optional point note
                    PdfPCell descCell = new PdfPCell();
                    descCell.Padding = 8;
                    descCell.BorderColor = borderColor;
                    descCell.AddElement(new Paragraph(p.ProdName, normalFont));
                    if (item.PointsUsed > 0)
                    {
                        Paragraph pointNote = new Paragraph($"(Discounted via {item.PointsUsed} points)", italicFont);
                        descCell.AddElement(pointNote);
                    }
                    itemTable.AddCell(descCell);

                    itemTable.AddCell(CreateItemCell(qty.ToString(), normalFont, Element.ALIGN_CENTER, borderColor));
                    itemTable.AddCell(CreateItemCell(listPrice.ToString("N2"), normalFont, Element.ALIGN_RIGHT, borderColor));
                    itemTable.AddCell(CreateItemCell(ourPrice.ToString("N2"), normalFont, Element.ALIGN_RIGHT, borderColor));
                    itemTable.AddCell(CreateItemCell(amount.ToString("N2"), boldFont, Element.ALIGN_RIGHT, borderColor));
                }
                document.Add(itemTable);

                // 4) CALCULATIONS & SUMMARY
                decimal deliveryCharges = (productTotal < 500 && productTotal > 0) ? 40.00m : 0.00m;
                // Points are ALREADY subtracted from ourPrice, so final payable is productTotal + delivery
                decimal finalPayable = productTotal + deliveryCharges;
                int pointsEarned = (int)(productTotal * 0.10m);

                document.Add(new Paragraph(" "));

                PdfPTable summaryContainer = new PdfPTable(2);
                summaryContainer.WidthPercentage = 100;
                summaryContainer.SetWidths(new float[] { 60, 40 });

                // Loyalty Summary Cell
                PdfPCell loyaltyCell = new PdfPCell();
                loyaltyCell.Border = Rectangle.NO_BORDER;
                loyaltyCell.AddElement(new Paragraph("LOYALTY PROGRAM", FontFactory.GetFont("Helvetica", 9, Font.BOLD, secondaryColor)));
                loyaltyCell.AddElement(new Paragraph($"Redeemed Points: {totalPointsRedeemed}", smallFont));
                loyaltyCell.AddElement(new Paragraph($"Earned Points: {pointsEarned}", smallFont));
                loyaltyCell.AddElement(new Paragraph("1 Point = ₹1.00 store credit", FontFactory.GetFont("Helvetica", 8, Font.ITALIC, secondaryColor)));
                summaryContainer.AddCell(loyaltyCell);
                
                // Summary Table Cell
                PdfPCell summaryCell = new PdfPCell();
                summaryCell.Border = Rectangle.NO_BORDER;
                
                PdfPTable summaryTable = new PdfPTable(2);
                summaryTable.WidthPercentage = 100;
                summaryTable.SetWidths(new float[] { 65, 35 });

                AddSummaryRow(summaryTable, "Subtotal (Cash):", productTotal.ToString("N2"), normalFont, primaryColor);
                AddSummaryRow(summaryTable, "Delivery Fee:", deliveryCharges.ToString("N2"), normalFont, primaryColor);
                
                // Show redeemed points purely for info, don't subtract again
                if (totalPointsRedeemed > 0)
                {
                    AddSummaryRow(summaryTable, "Points Applied (Info):", $"{totalPointsRedeemed}", smallFont, secondaryColor);
                }
                
                PdfPCell lineCell = new PdfPCell();
                lineCell.Colspan = 2;
                lineCell.PaddingTop = 8;
                lineCell.PaddingBottom = 8;
                lineCell.Border = Rectangle.TOP_BORDER;
                lineCell.BorderColorTop = borderColor;
                summaryTable.AddCell(lineCell);

                AddSummaryRow(summaryTable, "TOTAL PAYABLE:", "INR " + finalPayable.ToString("N2"), totalAmountFont, primaryColor);

                summaryCell.AddElement(summaryTable);
                summaryContainer.AddCell(summaryCell);

                document.Add(summaryContainer);

                // FOOTER
                document.Add(new Paragraph(" "));
                document.Add(new Paragraph(" "));
                document.Add(new Paragraph(new Chunk(new iTextSharp.text.pdf.draw.LineSeparator(1f, 100, secondaryColor, Element.ALIGN_CENTER, -2))));
                
                Paragraph footer = new Paragraph("Thank you for choosing e-MART. We hope to see you again soon!", FontFactory.GetFont("Helvetica", 10, Font.ITALIC, secondaryColor));
                footer.Alignment = Element.ALIGN_CENTER;
                document.Add(footer);

                document.Close();
                return ms.ToArray();
            }
        }

        private void AddOrderInfo(PdfPTable table, string label, string value, Font labelFont, Font valueFont, BaseColor color)
        {
            PdfPCell cellLabel = new PdfPCell(new Phrase(label, labelFont));
            cellLabel.Border = Rectangle.NO_BORDER;
            cellLabel.HorizontalAlignment = Element.ALIGN_RIGHT;
            cellLabel.PaddingBottom = 3;
            table.AddCell(cellLabel);

            PdfPCell cellValue = new PdfPCell(new Phrase(value, valueFont));
            cellValue.Border = Rectangle.NO_BORDER;
            cellValue.HorizontalAlignment = Element.ALIGN_RIGHT;
            cellValue.PaddingBottom = 3;
            table.AddCell(cellValue);
        }

        private void AddSummaryRow(PdfPTable table, string label, string value, Font font, BaseColor color)
        {
            PdfPCell cellLabel = new PdfPCell(new Phrase(label, font));
            cellLabel.Border = Rectangle.NO_BORDER;
            cellLabel.PaddingBottom = 6;
            table.AddCell(cellLabel);

            PdfPCell cellValue = new PdfPCell(new Phrase(value.StartsWith("INR") ? value : "₹" + value, font));
            cellValue.Border = Rectangle.NO_BORDER;
            cellValue.HorizontalAlignment = Element.ALIGN_RIGHT;
            cellValue.PaddingBottom = 6;
            table.AddCell(cellValue);
        }

        private PdfPCell CreateItemCell(string text, Font font, int alignment, BaseColor borderColor)
        {
            PdfPCell cell = new PdfPCell(new Phrase(text, font));
            cell.Padding = 8;
            cell.HorizontalAlignment = alignment;
            cell.VerticalAlignment = Element.ALIGN_MIDDLE;
            cell.BorderColor = borderColor;
            return cell;
        }

        private PdfPCell CreateSimpleCell(string text, Font font, int alignment)
        {
            PdfPCell cell = new PdfPCell(new Phrase(text, font));
            cell.HorizontalAlignment = alignment;
            cell.Padding = 5;
            cell.Border = Rectangle.NO_BORDER;
            return cell;
        }

        private PdfPCell CreateHeaderCell(string text)
        {
            Font font = FontFactory.GetFont("Helvetica", 9, Font.BOLD, BaseColor.White);
            PdfPCell cell = new PdfPCell(new Phrase(text, font));
            cell.BackgroundColor = new BaseColor(44, 62, 80);
            cell.HorizontalAlignment = Element.ALIGN_CENTER;
            cell.Padding = 5;
            cell.Border = Rectangle.NO_BORDER;
            return cell;
        }
    }
}
