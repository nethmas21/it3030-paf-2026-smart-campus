package com.example.demo.dto.request;

import jakarta.validation.constraints.Size;

public class BookingDecisionRequest {

    @Size(max = 500, message = "Reason must not exceed 500 characters")
    private String reason;

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}