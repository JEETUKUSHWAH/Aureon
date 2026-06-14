package com.fintech.FintechBackend.operations;

import com.fintech.FintechBackend.repository.AccountingExportRepository;
import com.fintech.FintechBackend.repository.TeamMemberRepository;
import com.fintech.FintechBackend.repository.TransactionRepository;
import com.fintech.FintechBackend.supportEntities.AccountingExport;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
class AccountingService {
    private final AccountingExportRepository exportRepo;
    private final TransactionRepository txRepo;
    private final TeamMemberRepository memberRepo;

    @Transactional
    public AccountingExport requestExport(ExportRequest req, UUID companyId, UUID memberId) {
        AccountingExport export = AccountingExport.builder()
                .company(memberRepo.getReferenceById(memberId).getCompany())
                .exportType(req.exportType()).fromDate(req.fromDate()).toDate(req.toDate())
                .status("PENDING").createdBy(memberRepo.getReferenceById(memberId)).build();
        export = exportRepo.save(export);
        processExportAsync(export.getId(), companyId, req);
        return export;
    }

    @org.springframework.scheduling.annotation.Async
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public void processExportAsync(UUID exportId, UUID companyId, ExportRequest req) {
        try {
            Thread.sleep(1000); // simulate processing
            // In real implementation: call QuickBooks/Xero API here
            // For college project: generate a CSV in memory and store URL
            String mockFileUrl = "/api/accounting/exports/" + exportId + "/download";

            exportRepo.findById(exportId).ifPresent(e -> {
                e.setStatus("COMPLETED");
                e.setFileUrl(mockFileUrl);
                e.setRecordCount(42); // mock count
                exportRepo.save(e);
            });
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
        }
    }

    public List<AccountingExport> listExports(UUID companyId) {
        return exportRepo.findByCompanyIdOrderByCreatedAtDesc(companyId);
    }

    /**
     * Generate a simple CSV ledger — mock output, no paid API
     */
    public String generateCsv(UUID exportId, UUID companyId) {
        StringBuilder csv = new StringBuilder("Date,Description,Amount,Currency,Rail,Status,Reference\n");
        // In a real project: query transactions between fromDate/toDate
        csv.append("2025-03-01,ACH payment to Vendor X,-1500.00,USD,ACH,COMPLETED,TXN-001\n");
        csv.append("2025-03-05,Wire to Acme Corp,-5000.00,USD,WIRE,COMPLETED,TXN-002\n");
        csv.append("2025-03-10,Invoice payment received,3000.00,USD,BOOK,COMPLETED,TXN-003\n");
        return csv.toString();
    }
}
