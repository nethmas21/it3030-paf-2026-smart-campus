package com.example.demo.dto.request;

import com.example.demo.enums.TicketCategory;
import com.example.demo.enums.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class CreateTicketRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 200, message = "Title must be between 5 and 200 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 10, message = "Description must be at least 10 characters")
    private String description;

    @NotNull(message = "Category is required")
    private TicketCategory category;

    @NotNull(message = "Priority is required")
    private TicketPriority priority;

    private Long resourceId;

    @Size(max = 300, message = "Location must not exceed 300 characters")
    private String location;

    // Accepts Sri Lankan phone (07XXXXXXXX or +947XXXXXXXX) OR email
    @Pattern(
        regexp = "^$|^(?:\\+94|0)(7[0-9]{8})$|^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
        message = "Enter a valid Sri Lankan phone number (e.g. 0771234567) or email address"
    )
    private String preferredContact;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public TicketCategory getCategory() { return category; }
    public void setCategory(TicketCategory category) { this.category = category; }

    public TicketPriority getPriority() { return priority; }
    public void setPriority(TicketPriority priority) { this.priority = priority; }

    public Long getResourceId() { return resourceId; }
    public void setResourceId(Long resourceId) { this.resourceId = resourceId; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getPreferredContact() { return preferredContact; }
    public void setPreferredContact(String preferredContact) { this.preferredContact = preferredContact; }
}