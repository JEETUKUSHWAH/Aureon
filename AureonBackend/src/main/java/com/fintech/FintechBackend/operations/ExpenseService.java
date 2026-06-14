package com.fintech.FintechBackend.operations;

import com.fintech.FintechBackend.entity.Expense;
import com.fintech.FintechBackend.entity.TeamMember;
import com.fintech.FintechBackend.exception.BadRequestException;
import com.fintech.FintechBackend.exception.NotFoundException;
import com.fintech.FintechBackend.repository.ExpenseRepository;
import com.fintech.FintechBackend.repository.TeamMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
class ExpenseService {
    private final ExpenseRepository expenseRepo;
    private final TeamMemberRepository memberRepo;

    @Transactional
    public Expense submit(SubmitExpenseRequest req, UUID companyId, UUID memberId) {
        TeamMember member = memberRepo.findById(memberId).orElseThrow();
        return expenseRepo.save(Expense.builder()
                .company(member.getCompany()).submittedBy(member)
                .amount(req.amount()).currency(req.currency() != null ? req.currency() : "USD")
                .merchantName(req.merchantName()).category(req.category())
                .description(req.description()).receiptUrl(req.receiptUrl())
                .reimbursable(req.reimbursable()).build());
    }

    public Page<Expense> list(UUID companyId, int page, int size) {
        return expenseRepo.findByCompanyId(companyId, PageRequest.of(page, size));
    }

    @Transactional
    public Expense review(UUID expenseId, ReviewExpenseRequest req, UUID companyId, UUID reviewerId) {
        Expense expense = expenseRepo.findByIdAndCompanyId(expenseId, companyId)
                .orElseThrow(() -> new NotFoundException("Expense not found"));
        if (expense.getStatus() != Expense.ExpenseStatus.PENDING) throw new BadRequestException("Already reviewed");
        expense.setStatus(Expense.ExpenseStatus.valueOf(req.decision()));
        expense.setReviewedBy(memberRepo.getReferenceById(reviewerId));
        expense.setReviewedAt(LocalDateTime.now());
        return expenseRepo.save(expense);
    }
}
