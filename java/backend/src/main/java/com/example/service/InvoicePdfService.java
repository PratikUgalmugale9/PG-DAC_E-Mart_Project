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

            Document document = new Document(PageSize.A4, 30, 30, 30, 30);
            PdfWriter.getInstance(document, baos);
            document.open();

            // ---------------- Fonts ----------------
            Font pageTitleFont = new Font(Font.HELVETICA, 14, Font.BOLD);
            Font logoFont = new Font(Font.HELVETICA, 20, Font.BOLD);
            Font normalFont = new Font(Font.HELVETICA, 10);
            Font smallFont = new Font(Font.HELVETICA, 9);
            Font boldFont = new Font(Font.HELVETICA, 10, Font.BOLD);

            // ==========================
            // 1) PAGE TITLE
            // ==========================
            Paragraph invoiceTitle = new Paragraph("INVOICE PAGE", pageTitleFont);
            invoiceTitle.setAlignment(Element.ALIGN_LEFT);
            document.add(invoiceTitle);

            document.add(new Paragraph(" "));

            // ==========================
            // 2) HEADER (Logo + Banner Area)
            // ==========================
            PdfPTable header = new PdfPTable(2);
            header.setWidthPercentage(100);
            header.setWidths(new float[] { 25, 75 });

            PdfPCell logoCell = new PdfPCell(new Phrase("e-MART", logoFont));
            logoCell.setFixedHeight(60);
            logoCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            logoCell.setHorizontalAlignment(Element.ALIGN_CENTER);

            PdfPCell bannerCell = new PdfPCell(new Phrase(
                    "BANNER AREA\n(Will have Images, Company name and Monogram)",
                    normalFont));
            bannerCell.setFixedHeight(60);
            bannerCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            bannerCell.setHorizontalAlignment(Element.ALIGN_CENTER);

            header.addCell(logoCell);
            header.addCell(bannerCell);

            document.add(header);

            document.add(new Paragraph(" "));

            // ==========================
            // 3) CATEGORY MENU (2 rows)
            // ==========================
            PdfPTable menu1 = new PdfPTable(6);
            menu1.setWidthPercentage(100);

            String[] row1 = {
                    "HOME",
                    "Apparel & Jewellery",
                    "Appliances",
                    "Books & Magazines",
                    "Consumer Electronics",
                    "Cameras"
            };

            for (String c : row1) {
                PdfPCell cell = new PdfPCell(new Phrase(c, smallFont));
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setPadding(5);
                menu1.addCell(cell);
            }
            document.add(menu1);

            PdfPTable menu2 = new PdfPTable(6);
            menu2.setWidthPercentage(100);

            String[] row2 = {
                    "Movie CDs",
                    "Music",
                    "Health & Beauty",
                    "Lightings",
                    "Home Furnishing",
                    "Kitchen & Bath"
            };

            for (String c : row2) {
                PdfPCell cell = new PdfPCell(new Phrase(c, smallFont));
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setPadding(5);
                menu2.addCell(cell);
            }
            document.add(menu2);

            document.add(new Paragraph(" "));

            // ==========================
            // 4) CUSTOMER NAME + ADDRESS (SINGLE)
            // ==========================
            User user = order.getUser();

            String customerName = "N/A";
            String customerAddress = "Not provided";

            if (user != null) {
                if (user.getFullName() != null) {
                    customerName = user.getFullName();
                }
                if (user.getAddress() != null) {
                    customerAddress = user.getAddress();
                }
            }

            PdfPTable addressTable = new PdfPTable(1);
            addressTable.setWidthPercentage(100);

            PdfPCell addressCell = new PdfPCell();
            addressCell.setPadding(8);

            addressCell.addElement(new Paragraph("Name : " + customerName, boldFont));
            addressCell.addElement(new Paragraph("Address : " + customerAddress, normalFont));

            addressTable.addCell(addressCell);
            document.add(addressTable);

            document.add(new Paragraph(" "));

            // ==========================
            // 5) ORDER INFO
            // ==========================
            String dateStr = "-";
            if (order.getOrderDate() != null) {
                dateStr = order.getOrderDate()
                        .atZone(ZoneId.systemDefault())
                        .toLocalDateTime()
                        .format(DateTimeFormatter.ofPattern("dd-MMM-yyyy HH:mm"));
            }

            document.add(new Paragraph("Order ID: " + order.getId(), normalFont));
            document.add(new Paragraph("Order Date: " + dateStr, normalFont));
            document.add(new Paragraph("Order Status: " + order.getOrderStatus(), normalFont));
            document.add(new Paragraph("Payment Mode: " + order.getPaymentMode(), normalFont));

            document.add(new Paragraph(" "));

            // ==========================
            // 6) ITEMS TABLE (BRD Style)
            // ==========================
            PdfPTable itemTable = new PdfPTable(6);
            itemTable.setWidthPercentage(100);
            itemTable.setWidths(new float[] { 10, 35, 8, 15, 15, 17 });

            itemTable.addCell(headerCell("Item Cd."));
            itemTable.addCell(headerCell("Item Desc."));
            itemTable.addCell(headerCell("Qty"));
            itemTable.addCell(headerCell("List price"));
            itemTable.addCell(headerCell("eMcard price"));
            itemTable.addCell(headerCell("Amount"));

            BigDecimal total = BigDecimal.ZERO;
            BigDecimal savings = BigDecimal.ZERO;
            int ePointsEarned = 0;

            for (OrderItem it : items) {

                Product p = it.getProduct();
                int qty = it.getQuantity();

                // Safety check
                if (p == null) {
                    continue;
                }

                BigDecimal listPrice = (p.getMrpPrice() == null) ? BigDecimal.ZERO : p.getMrpPrice();
                BigDecimal emcardPrice = (p.getCardholderPrice() == null) ? listPrice : p.getCardholderPrice();

                BigDecimal amount = emcardPrice.multiply(BigDecimal.valueOf(qty));
                total = total.add(amount);

                BigDecimal save = (listPrice.subtract(emcardPrice)).multiply(BigDecimal.valueOf(qty));
                savings = savings.add(save);

                if (p.getPointsToBeRedeem() != null) {
                    ePointsEarned += p.getPointsToBeRedeem();
                }

                String itemCode = "P" + p.getId();
                String itemDesc = p.getProdName() + " - " + (p.getProdShortDesc() == null ? "" : p.getProdShortDesc());

                itemTable.addCell(normalCell(itemCode));
                itemTable.addCell(normalCell(itemDesc));
                itemTable.addCell(centerCell(String.valueOf(qty)));
                itemTable.addCell(rightCell(DF.format(listPrice)));
                itemTable.addCell(rightCell(DF.format(emcardPrice)));
                itemTable.addCell(rightCell(DF.format(amount)));
            }

            document.add(itemTable);

            document.add(new Paragraph(" "));

            // ==========================
            // 7) TOTAL SECTION (Right side)
            // ==========================
            PdfPTable totalTable = new PdfPTable(2);
            totalTable.setWidthPercentage(40);
            totalTable.setHorizontalAlignment(Element.ALIGN_RIGHT);
            totalTable.setWidths(new float[] { 60, 40 });

            totalTable.addCell(headerCell("TOTAL"));
            totalTable.addCell(rightCell(DF.format(total)));

            totalTable.addCell(normalCell("e-Points earned"));
            totalTable.addCell(rightCell(String.valueOf(ePointsEarned)));

            totalTable.addCell(normalCell("You save:"));
            totalTable.addCell(rightCell(DF.format(savings)));

            document.add(totalTable);

            document.add(new Paragraph(" "));

            // ==========================
            // 8) e-Point Account Section
            // ==========================
            document.add(new Paragraph("Your e-Point A/c:", boldFont));

            PdfPTable epointTable = new PdfPTable(2);
            epointTable.setWidthPercentage(40);
            epointTable.setWidths(new float[] { 60, 40 });

            // Static values (you can connect to points table later)
            epointTable.addCell(normalCell("OP Bal:"));
            epointTable.addCell(rightCell("0"));

            epointTable.addCell(normalCell("Tot Credited:"));
            epointTable.addCell(rightCell(String.valueOf(ePointsEarned)));

            epointTable.addCell(normalCell("Redeemed today:"));
            epointTable.addCell(rightCell("0"));

            epointTable.addCell(normalCell("CL Bal:"));
            epointTable.addCell(rightCell(String.valueOf(ePointsEarned)));

            document.add(epointTable);

            document.add(new Paragraph(" "));
            document.add(new Paragraph("Thank you for shopping with e-MART!", normalFont));

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error while generating PDF invoice", e);
        }
    }

    // ==========================
    // Helper methods
    // ==========================
    private PdfPCell headerCell(String text) {
        Font font = new Font(Font.HELVETICA, 9, Font.BOLD, java.awt.Color.WHITE);
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(java.awt.Color.DARK_GRAY);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(5);
        return cell;
    }

    private PdfPCell normalCell(String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text == null ? "" : text, new Font(Font.HELVETICA, 9)));
        cell.setPadding(5);
        return cell;
    }

    private PdfPCell rightCell(String text) {
        PdfPCell cell = normalCell(text);
        cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        return cell;
    }

    private PdfPCell centerCell(String text) {
        PdfPCell cell = normalCell(text);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
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