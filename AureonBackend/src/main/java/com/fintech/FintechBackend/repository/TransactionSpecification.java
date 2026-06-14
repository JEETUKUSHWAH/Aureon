package com.fintech.FintechBackend.repository;
import com.fintech.FintechBackend.entity.Transaction;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class TransactionSpecification {

    private TransactionSpecification() {}

    public static Specification<Transaction> filter(
            UUID companyId,
            UUID accountId,
            Transaction.PaymentRail rail,
            Transaction.TransactionStatus status,
            LocalDateTime from,
            LocalDateTime to) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("company").get("id"), companyId));

            if (accountId != null) {
                predicates.add(cb.or(
                        cb.equal(root.get("fromAccount").get("id"), accountId),
                        cb.equal(root.get("toAccount").get("id"), accountId)
                ));
            }

            if (rail != null) {
                predicates.add(cb.equal(root.get("paymentRail"), rail));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (from != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), from));
            }

            if (to != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), to));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}