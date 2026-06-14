package com.fintech.FintechBackend.entity;

import java.math.BigDecimal;

public class LineItem {

    private String description;
    private BigDecimal amount;
    private BigDecimal quantity;

    public String getDescription() {
        return description;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }
}
