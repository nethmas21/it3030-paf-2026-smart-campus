package com.example.demo.controller;

import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.dto.request.AddCommentRequest;
import com.example.demo.dto.request.AssignTechnicianRequest;
import com.example.demo.dto.request.CreateTicketRequest;
import com.example.demo.dto.request.UpdateTicketStatusRequest;
import com.example.demo.dto.response.ApiResponse;
import com.example.demo.dto.response.CommentResponse;
import com.example.demo.dto.response.TicketResponse;
import com.example.demo.enums.TicketCategory;
import com.example.demo.enums.TicketPriority;
import com.example.demo.enums.TicketStatus;
import com.example.demo.service.TicketService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tickets")
@CrossOrigin(origins = "${app.cors.allowed-origins:http://localhost:3000}")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    // ── POST /api/v1/tickets ─────────────────────────────────────────────────
    // Any authenticated user can create a ticket
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<TicketResponse>> createTicket(
            @Valid @RequestBody CreateTicketRequest request,
            @AuthenticationPrincipal OAuth2User principal) {

        String userId = principal.getAttribute("sub");
        TicketResponse response = ticketService.createTicket(request, userId);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Ticket created successfully", response));
    }

    // ── GET /api/v1/tickets ──────────────────────────────────────────────────
    // ADMIN sees all; USER sees only their own
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Page<TicketResponse>>> getTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketCategory category,
            @RequestParam(required = false) TicketPriority priority,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal OAuth2User principal) {

        boolean isAdmin = hasRole(principal, "ADMIN");
        String userId = principal.getAttribute("sub");

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<TicketResponse> tickets = isAdmin
                ? ticketService.getAllTickets(status, category, priority, null, pageable)
                : ticketService.getMyTickets(userId, pageable);

        return ResponseEntity.ok(ApiResponse.success(tickets));
    }

    // ── GET /api/v1/tickets/{id} ─────────────────────────────────────────────
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<TicketResponse>> getTicketById(
            @PathVariable Long id,
            @AuthenticationPrincipal OAuth2User principal) {

        TicketResponse ticket = ticketService.getTicketById(id);

        // Users can only view their own tickets; admins can view all
        String userId = principal.getAttribute("sub");
        boolean isAdmin = hasRole(principal, "ADMIN");
        if (!isAdmin && !ticket.getCreatedBy().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access denied"));
        }

        return ResponseEntity.ok(ApiResponse.success(ticket));
    }

    // ── PATCH /api/v1/tickets/{id}/status ────────────────────────────────────
    // Technician or Admin can update status
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<ApiResponse<TicketResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTicketStatusRequest request,
            @AuthenticationPrincipal OAuth2User principal) {

        String role = hasRole(principal, "ADMIN") ? "ADMIN" : "TECHNICIAN";
        TicketResponse response = ticketService.updateStatus(id, request, role);
        return ResponseEntity.ok(ApiResponse.success("Ticket status updated", response));
    }

    // ── PATCH /api/v1/tickets/{id}/assign-technician ─────────────────────────
    // Admin only
    @PatchMapping("/{id}/assign-technician")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TicketResponse>> assignTechnician(
            @PathVariable Long id,
            @Valid @RequestBody AssignTechnicianRequest request) {

        TicketResponse response = ticketService.assignTechnician(id, request);
        return ResponseEntity.ok(ApiResponse.success("Technician assigned", response));
    }

    // ── DELETE /api/v1/tickets/{id} ──────────────────────────────────────────
    // Admin only
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteTicket(@PathVariable Long id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.ok(ApiResponse.success("Ticket deleted", null));
    }

    // ── POST /api/v1/tickets/{id}/attachments ────────────────────────────────
    // Multipart upload — max 3 images per ticket
    @PostMapping(value = "/{id}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<TicketResponse>> uploadAttachments(
            @PathVariable Long id,
            @RequestParam("files") List<MultipartFile> files) {

        if (files == null || files.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("No files provided"));
        }
        TicketResponse response = ticketService.addAttachments(id, files);
        return ResponseEntity.ok(ApiResponse.success("Attachments uploaded", response));
    }

    // ── POST /api/v1/tickets/{id}/comments ───────────────────────────────────
    @PostMapping("/{id}/comments")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<CommentResponse>> addComment(
            @PathVariable Long id,
            @Valid @RequestBody AddCommentRequest request,
            @AuthenticationPrincipal OAuth2User principal) {

        String authorId   = principal.getAttribute("sub");
        String authorName = principal.getAttribute("name");
        CommentResponse response = ticketService.addComment(id, request, authorId, authorName);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Comment added", response));
    }

    // ── PUT /api/v1/tickets/{id}/comments/{commentId} ────────────────────────
    @PutMapping("/{id}/comments/{commentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<CommentResponse>> updateComment(
            @PathVariable Long id,
            @PathVariable Long commentId,
            @Valid @RequestBody AddCommentRequest request,
            @AuthenticationPrincipal OAuth2User principal) {

        String requesterId = principal.getAttribute("sub");
        CommentResponse response = ticketService.updateComment(id, commentId, request, requesterId);
        return ResponseEntity.ok(ApiResponse.success("Comment updated", response));
    }

    // ── DELETE /api/v1/tickets/{id}/comments/{commentId} ─────────────────────
    @DeleteMapping("/{id}/comments/{commentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @PathVariable Long id,
            @PathVariable Long commentId,
            @AuthenticationPrincipal OAuth2User principal) {

        String requesterId = principal.getAttribute("sub");
        boolean isAdmin    = hasRole(principal, "ADMIN");
        ticketService.deleteComment(id, commentId, requesterId, isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Comment deleted", null));
    }

    // ── Utility ───────────────────────────────────────────────────────────────

    private boolean hasRole(OAuth2User principal, String role) {
        return principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_" + role));
    }
}