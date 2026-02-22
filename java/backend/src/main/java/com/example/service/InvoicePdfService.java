package com.example.service;

import com.example.entity.OrderItem;
import com.example.entity.Ordermaster;
import com.example.entity.Product;
import com.example.entity.User;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;

import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class InvoicePdfService {

    private static final DecimalFormat DF = new DecimalFormat("0.00");

    public byte[] generateInvoicePdf(Ordermaster order, List<OrderItem> items) {

        if (order == null) {
            throw new RuntimeException("Order not found!");
        }

        if (items == null || items.isEmpty()) {
            throw new RuntimeException("No order items found!");
        }

        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();

            Document document = new Document(PageSize.A4, 40, 40, 40, 40);
            PdfWriter.getInstance(document, baos);
            document.open();

            // Colors (Premium Charcoal & Slate)
            java.awt.Color primaryColor = new java.awt.Color(44, 62, 80); // Charcoal
            java.awt.Color secondaryColor = new java.awt.Color(127, 140, 141); // Slate Gray
            java.awt.Color borderColor = new java.awt.Color(200, 200, 200);
            java.awt.Color whiteColor = java.awt.Color.WHITE;

            // Fonts
            Font titleFont = new Font(Font.HELVETICA, 24, Font.BOLD, primaryColor);
            Font headerFont = new Font(Font.HELVETICA, 10, Font.BOLD, whiteColor);
            Font normalFont = new Font(Font.HELVETICA, 10, Font.NORMAL, primaryColor);
            Font boldFont = new Font(Font.HELVETICA, 10, Font.BOLD, primaryColor);
            Font smallFont = new Font(Font.HELVETICA, 9, Font.NORMAL, secondaryColor);
            Font italicFont = new Font(Font.HELVETICA, 9, Font.ITALIC, secondaryColor);
            Font totalAmountFont = new Font(Font.HELVETICA, 13, Font.BOLD, primaryColor);
            Font invoiceFont = new Font(Font.HELVETICA, 16, Font.BOLD, primaryColor);

            // ==========================
            // 1) HEADER / LOGO
            // ==========================
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[] { 50, 50 });

            PdfPCell logoCell = new PdfPCell(new Phrase("e-MART", titleFont));
            logoCell.setBorder(Rectangle.NO_BORDER);
            logoCell.setVerticalAlignment(Element.ALIGN_BOTTOM);
            headerTable.addCell(logoCell);

            PdfPCell infoCell = new PdfPCell();
            infoCell.setBorder(Rectangle.NO_BORDER);
            infoCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            Paragraph pHeader = new Paragraph("PREMIUM ONLINE SHOPPING", smallFont);
            pHeader.setAlignment(Element.ALIGN_RIGHT);
            infoCell.addElement(pHeader);
            Paragraph pInv = new Paragraph("TAX INVOICE", invoiceFont);
            pInv.setAlignment(Element.ALIGN_RIGHT);
            infoCell.addElement(pInv);
            headerTable.addCell(infoCell);

            document.add(headerTable);
            document.add(new Paragraph(new Chunk(new com.lowagie.text.pdf.draw.LineSeparator(1f, 100, secondaryColor, Element.ALIGN_CENTER, -2))));
            document.add(new Paragraph(" "));

            // ==========================
            // 2) CUSTOMER & ORDER DETAILS
            // ==========================
            PdfPTable detailsTable = new PdfPTable(2);
            detailsTable.setWidthPercentage(100);
            detailsTable.setWidths(new float[] { 60, 40 });

            // Bill To
            PdfPCell billToCell = new PdfPCell();
            billToCell.setBorder(Rectangle.NO_BORDER);
            billToCell.setPaddingTop(10);
            
            User user = order.getUser();
            String customerName = (user != null && user.getFullName() != null) ? user.getFullName() : "N/A";
            String customerAddress = (user != null && user.getAddress() != null) ? user.getAddress() : "Address not provided";
            
            billToCell.addElement(new Paragraph("BILL TO", new Font(Font.HELVETICA, 9, Font.BOLD, secondaryColor)));
            billToCell.addElement(new Paragraph(customerName, boldFont));
            billToCell.addElement(new Paragraph(customerAddress, normalFont));
            detailsTable.addCell(billToCell);

            // Order Info
            PdfPCell orderInfoCell = new PdfPCell();
            orderInfoCell.setBorder(Rectangle.NO_BORDER);
            orderInfoCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            orderInfoCell.setPaddingTop(10);

            PdfPTable innerOrderTable = new PdfPTable(2);
            innerOrderTable.setWidthPercentage(100);
            innerOrderTable.setWidths(new float[] { 50, 50 });

            String dateStr = "N/A";
            if (order.getOrderDate() != null) {
                dateStr = order.getOrderDate()
                        .atZone(ZoneId.systemDefault())
                        .toLocalDateTime()
                        .format(DateTimeFormatter.ofPattern("dd-MMM-yyyy"));
            }

            addOrderInfo(innerOrderTable, "Invoice Number:", "INV-" + order.getId(), smallFont, boldFont, primaryColor);
            addOrderInfo(innerOrderTable, "Date:", dateStr, smallFont, normalFont, primaryColor);
            addOrderInfo(innerOrderTable, "Payment Mode:", order.getPaymentMode() != null ? order.getPaymentMode() : "N/A", smallFont, normalFont, primaryColor);

            orderInfoCell.addElement(innerOrderTable);
            detailsTable.addCell(orderInfoCell);

            document.add(detailsTable);
            document.add(new Paragraph(" "));

            // ==========================
            // 3) ITEMS TABLE
            // ==========================
            PdfPTable itemTable = new PdfPTable(6);
            itemTable.setWidthPercentage(100);
            itemTable.setWidths(new float[] { 10, 42, 8, 13, 13, 14 });
            itemTable.setHeaderRows(1);

            String[] headers = { "SKU", "ITEM DESCRIPTION", "QTY", "LIST PRICE", "OUR PRICE", "TOTAL" };
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h, headerFont));
                cell.setBackgroundColor(primaryColor);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                cell.setBorder(Rectangle.NO_BORDER);
                cell.setPadding(10);
                itemTable.addCell(cell);
            }

            BigDecimal productTotal = BigDecimal.ZERO;
            int totalPointsRedeemed = 0;
            boolean hasLoyaltyBenefits = false;

            for (OrderItem item : items) {
                Product p = item.getProduct();
                if (p == null) continue;

                BigDecimal listPrice = (p.getMrpPrice() != null) ? p.getMrpPrice() : BigDecimal.ZERO;

                // For POINTS items, the cash price is 0 (paid via points only)
                BigDecimal ourPrice;
                if ("POINTS".equals(item.getPriceType())) {
                    ourPrice = BigDecimal.ZERO;
                    hasLoyaltyBenefits = true;
                } else {
                    ourPrice = item.getPrice();
                    if ("LOYALTY".equals(item.getPriceType())) {
                        hasLoyaltyBenefits = true;
                    }
                }

                int qty = item.getQuantity();
                BigDecimal amount = ourPrice.multiply(BigDecimal.valueOf(qty));

                productTotal = productTotal.add(amount); // Only adds cash amount (0 for POINTS items)
                
                int itemPointsUsed = (item.getPointsUsed() != null) ? item.getPointsUsed() : 0;
                totalPointsRedeemed += itemPointsUsed;
                
                if (itemPointsUsed > 0) {
                    hasLoyaltyBenefits = true;
                }

                String itemCode = "P" + p.getId();

                itemTable.addCell(createItemCell(itemCode, normalFont, Element.ALIGN_CENTER, borderColor));

                // Description with optional point note
                PdfPCell descCell = new PdfPCell();
                descCell.setPadding(8);
                descCell.setBorderColor(borderColor);
                descCell.addElement(new Paragraph(p.getProdName(), normalFont));
                if (itemPointsUsed > 0) {
                    Paragraph pointNote = new Paragraph("(Discounted via " + itemPointsUsed + " points)", italicFont);
                    descCell.addElement(pointNote);
                }
                itemTable.addCell(descCell);

                itemTable.addCell(createItemCell(String.valueOf(qty), normalFont, Element.ALIGN_CENTER, borderColor));
                itemTable.addCell(createItemCell(DF.format(listPrice), normalFont, Element.ALIGN_RIGHT, borderColor));
                itemTable.addCell(createItemCell(DF.format(ourPrice), normalFont, Element.ALIGN_RIGHT, borderColor));
                itemTable.addCell(createItemCell(DF.format(amount), boldFont, Element.ALIGN_RIGHT, borderColor));
            }
            document.add(itemTable);

            // ==========================
            // 4) CALCULATIONS & SUMMARY
            // ==========================
            BigDecimal deliveryCharges = (productTotal.compareTo(new BigDecimal("500")) < 0 && productTotal.compareTo(BigDecimal.ZERO) > 0) 
                ? new BigDecimal("40.00") 
                : BigDecimal.ZERO;
            
            // Points are ALREADY subtracted from ourPrice, so final payable is productTotal + delivery
            BigDecimal finalPayable = productTotal.add(deliveryCharges);

            // Calculate earned points ONLY on cash-paid items (exclude POINTS items)
            // AND only if user has loyalty benefits
            int pointsEarned = hasLoyaltyBenefits ? productTotal.multiply(new BigDecimal("0.10")).intValue() : 0;

            document.add(new Paragraph(" "));

            PdfPTable summaryContainer = new PdfPTable(2);
            summaryContainer.setWidthPercentage(100);
            summaryContainer.setWidths(new float[] { 60, 40 });

            // Loyalty Summary Cell
            PdfPCell loyaltyCell = new PdfPCell();
            loyaltyCell.setBorder(Rectangle.NO_BORDER);
            loyaltyCell.addElement(new Paragraph("LOYALTY PROGRAM", new Font(Font.HELVETICA, 9, Font.BOLD, secondaryColor)));
            loyaltyCell.addElement(new Paragraph("Redeemed Points: " + totalPointsRedeemed, smallFont));
            loyaltyCell.addElement(new Paragraph("Earned Points: " + pointsEarned, smallFont));
            loyaltyCell.addElement(new Paragraph("1 Point = ₹1.00 store credit", new Font(Font.HELVETICA, 8, Font.ITALIC, secondaryColor)));
            summaryContainer.addCell(loyaltyCell);

            // Summary Table Cell
            PdfPCell summaryCell = new PdfPCell();
            summaryCell.setBorder(Rectangle.NO_BORDER);

            PdfPTable summaryTable = new PdfPTable(2);
            summaryTable.setWidthPercentage(100);
            summaryTable.setWidths(new float[] { 65, 35 });

            addSummaryRow(summaryTable, "Subtotal (Cash):", DF.format(productTotal), normalFont, primaryColor);
            addSummaryRow(summaryTable, "Delivery Fee:", DF.format(deliveryCharges), normalFont, primaryColor);

            // Show redeemed points purely for info, don't subtract again
            if (totalPointsRedeemed > 0) {
                addSummaryRow(summaryTable, "Points Applied (Info):", String.valueOf(totalPointsRedeemed), smallFont, secondaryColor);
            }

            PdfPCell lineCell = new PdfPCell();
            lineCell.setColspan(2);
            lineCell.setPaddingTop(8);
            lineCell.setPaddingBottom(8);
            lineCell.setBorder(Rectangle.TOP);
            lineCell.setBorderColorTop(borderColor);
            summaryTable.addCell(lineCell);

            addSummaryRow(summaryTable, "TOTAL PAYABLE:", "INR " + DF.format(finalPayable), totalAmountFont, primaryColor);

            summaryCell.addElement(summaryTable);
            summaryContainer.addCell(summaryCell);

            document.add(summaryContainer);

            // ==========================
            // FOOTER
            // ==========================
            document.add(new Paragraph(" "));
            document.add(new Paragraph(" "));
            document.add(new Paragraph(new Chunk(new com.lowagie.text.pdf.draw.LineSeparator(1f, 100, secondaryColor, Element.ALIGN_CENTER, -2))));

            Paragraph footer = new Paragraph("Thank you for choosing e-MART. We hope to see you again soon!", new Font(Font.HELVETICA, 10, Font.ITALIC, secondaryColor));
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error while generating PDF invoice", e);
        }
    }

    // ==========================
    // Helper methods
    // ==========================
    private void addOrderInfo(PdfPTable table, String label, String value, Font labelFont, Font valueFont, java.awt.Color color) {
        PdfPCell cellLabel = new PdfPCell(new Phrase(label, labelFont));
        cellLabel.setBorder(Rectangle.NO_BORDER);
        cellLabel.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cellLabel.setPaddingBottom(3);
        table.addCell(cellLabel);

        PdfPCell cellValue = new PdfPCell(new Phrase(value, valueFont));
        cellValue.setBorder(Rectangle.NO_BORDER);
        cellValue.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cellValue.setPaddingBottom(3);
        table.addCell(cellValue);
    }

    private void addSummaryRow(PdfPTable table, String label, String value, Font font, java.awt.Color color) {
        PdfPCell cellLabel = new PdfPCell(new Phrase(label, font));
        cellLabel.setBorder(Rectangle.NO_BORDER);
        cellLabel.setPaddingBottom(6);
        table.addCell(cellLabel);

        String displayValue = value.startsWith("INR") ? value : "₹" + value;
        PdfPCell cellValue = new PdfPCell(new Phrase(displayValue, font));
        cellValue.setBorder(Rectangle.NO_BORDER);
        cellValue.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cellValue.setPaddingBottom(6);
        table.addCell(cellValue);
    }

    private PdfPCell createItemCell(String text, Font font, int alignment, java.awt.Color borderColor) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(8);
        cell.setHorizontalAlignment(alignment);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setBorderColor(borderColor);
        return cell;
    }

    // Added by Hamzah - wrapper method for payment email invoice
    public byte[] generateInvoiceAsBytes(Ordermaster order, List<OrderItem> items) {

        if (order == null) {
            throw new RuntimeException("Order not found!");
        }

        if (items == null || items.isEmpty()) {
            throw new RuntimeException("No order items found!");
        }

        return generateInvoicePdf(order, items);
    }
}