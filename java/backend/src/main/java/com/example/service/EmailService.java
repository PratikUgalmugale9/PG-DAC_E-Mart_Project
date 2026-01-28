package com.example.service;

import java.io.ByteArrayInputStream;

import jakarta.mail.internet.MimeMessage;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamSource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.example.entity.Ordermaster;
import com.example.entity.User;


@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    // ✅ Login success mail
    public void sendLoginSuccessMail(User user) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject("Login Successful");
        message.setText(
                "Hello " + user.getFullName() + ",\n\n" +
                "You have successfully logged in.\n\n" +
                "Regards,\nE-Mart Team"
        );
        mailSender.send(message);
    }

    // ✅ Payment success mail + invoice
    public void sendPaymentSuccessMail(Ordermaster order, byte[] invoicePdf) throws Exception {

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setTo(order.getUser().getEmail());
        helper.setSubject("Payment Successful - Invoice Attached");

        helper.setText(
                "Hello " + order.getUser().getFullName() + ",<br/><br/>" +
                "Your payment was successful.<br/>" +
                "Please find your invoice attached.<br/><br/>" +
                "Regards,<br/>E-Mart Team",
                true
        );

        helper.addAttachment(
                "invoice_" + order.getId() + ".pdf",
                (InputStreamSource) () -> new ByteArrayInputStream(invoicePdf)
        );

        mailSender.send(message);
    }
}
