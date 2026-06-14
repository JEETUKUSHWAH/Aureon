package com.fintech.FintechBackend.operations;

import com.fintech.FintechBackend.entity.*;
import com.fintech.FintechBackend.exception.*;
import com.fintech.FintechBackend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.*;
import java.util.*;


@Service @RequiredArgsConstructor @Slf4j
public class InvoiceService {
    private final InvoiceRepository invoiceRepo;
    private final AccountRepository accountRepo;
    private final TeamMemberRepository memberRepo;

    @Transactional public Invoice create(CreateInvoiceRequest req, UUID companyId, UUID memberId) {
        Account account = accountRepo.findByIdAndCompanyId(req.accountId(), companyId)
                .orElseThrow(() -> new NotFoundException("Account not found"));

        String num = "INV-" + LocalDate.now().getYear() + "-" +
                String.format("%04d", (int)(Math.random() * 9999));

        Invoice inv = Invoice.builder()
                .company(account.getCompany()).account(account)
                .invoiceNumber(num).clientName(req.clientName())
                .clientEmail(req.clientEmail()).clientAddress(req.clientAddress())
                .lineItems(req.lineItems()).subtotal(req.subtotal())
                .taxRate(req.taxRate() != null ? req.taxRate() : BigDecimal.ZERO)
                .taxAmount(req.taxRate() != null ? req.subtotal().multiply(req.taxRate().divide(BigDecimal.valueOf(100))) : BigDecimal.ZERO)
                .totalAmount(req.totalAmount())
                .currency(req.currency() != null ? req.currency() : "USD")
                .dueDate(req.dueDate()).notes(req.notes())
                .createdBy(memberRepo.getReferenceById(memberId)).build();
        return invoiceRepo.save(inv);
    }

    @Transactional public Invoice send(UUID invoiceId, UUID companyId) {
        Invoice inv = invoiceRepo.findByIdAndCompanyId(invoiceId, companyId)
                .orElseThrow(() -> new NotFoundException("Invoice not found"));
        if (inv.getStatus() != Invoice.InvoiceStatus.DRAFT) throw new BadRequestException("Only DRAFT invoices can be sent");
        inv.setStatus(Invoice.InvoiceStatus.SENT);
        log.info("Invoice {} sent to {}", inv.getInvoiceNumber(), inv.getClientEmail());
        return invoiceRepo.save(inv);
    }

    @Transactional public Invoice markPaid(UUID invoiceId, UUID companyId) {
        Invoice inv = invoiceRepo.findByIdAndCompanyId(invoiceId, companyId)
                .orElseThrow(() -> new NotFoundException("Invoice not found"));
        inv.setStatus(Invoice.InvoiceStatus.PAID);
        inv.setPaidAt(LocalDateTime.now());
        return invoiceRepo.save(inv);
    }

    public Page<Invoice> list(UUID companyId, int page, int size) {
        return invoiceRepo.findByCompanyId(companyId, PageRequest.of(page, size));
    }
}


