package com.example.controller;

import com.example.entity.OrderItem;
import com.example.entity.Ordermaster;
import com.example.service.InvoicePdfService;
import com.example.service.OrderItemService;
import com.example.service.OrderService;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/invoice")
@CrossOrigin
public class InvoiceController {

    private final OrderService orderService;
    private final OrderItemService orderItemService;
    private final InvoicePdfService invoicePdfService;

    public InvoiceController(OrderService orderService,
            OrderItemService orderItemService,
            InvoicePdfService invoicePdfService) {
        this.orderService = orderService;
        this.orderItemService = orderItemService;
        this.invoicePdfService = invoicePdfService;
    }

    @GetMapping("/pdf/{orderId}")
    public ResponseEntity<byte[]> downloadInvoicePdf(@PathVariable Integer orderId) {

        // ✅ 1) Get OrderMaster
        Ordermaster order = orderService.getOrderEntity(orderId);

        // ✅ 2) Get OrderItems
        List<OrderItem> items = orderItemService.getItemsByOrderId(orderId);

        // ✅ 3) Generate PDF
        byte[] pdfBytes = invoicePdfService.generateInvoicePdf(order, items);

        // ✅ 4) Return PDF
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=invoice_" + orderId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}