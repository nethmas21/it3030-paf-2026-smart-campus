package com.example.demo.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.dto.request.AddCommentRequest;
import com.example.demo.dto.request.AssignTechnicianRequest;
import com.example.demo.dto.request.CreateTicketRequest;
import com.example.demo.dto.request.UpdateTicketStatusRequest;
import com.example.demo.dto.response.CommentResponse;
import com.example.demo.dto.response.TicketResponse;
import com.example.demo.entity.Ticket;
import com.example.demo.entity.TicketComment;
import com.example.demo.enums.TicketCategory;
import com.example.demo.enums.TicketPriority;
import com.example.demo.enums.TicketStatus;
import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.TicketCommentRepository;
import com.example.demo.repository.TicketRepository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TicketCommentRepository commentRepository;

    @Value("${app.upload.dir:uploads/tickets}")
    private String uploadDir;

    private static final List<String> ALLOWED_CONTENT_TYPES =
            List.of("image/jpeg", "image/png", "image/gif", "image/webp");
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

    public TicketService(TicketRepository ticketRepository,
                         TicketCommentRepository commentRepository) {
        this.ticketRepository = ticketRepository;
        this.commentRepository = commentRepository;
    }

    // ── Create ────────────────────────────────────────────────────────────────

    public TicketResponse createTicket(CreateTicketRequest request, String createdBy) {
        Ticket ticket = new Ticket();
        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setCategory(request.getCategory());
        ticket.setPriority(request.getPriority());
        ticket.setResourceId(request.getResourceId());
        ticket.setLocation(request.getLocation());
        ticket.setPreferredContact(request.getPreferredContact());
        ticket.setCreatedBy(createdBy);
        ticket.setStatus(TicketStatus.OPEN);
        return toResponse(ticketRepository.save(ticket));
    }

    // ── Read ──────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public TicketResponse getTicketById(Long id) {
        return toResponse(findTicket(id));
    }

    @Transactional(readOnly = true)
    public Page<TicketResponse> getAllTickets(TicketStatus status, TicketCategory category,
                                              TicketPriority priority, String createdBy,
                                              Pageable pageable) {
        return ticketRepository
                .findWithFilters(status, category, priority, createdBy, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<TicketResponse> getMyTickets(String userId, Pageable pageable) {
        return ticketRepository.findByCreatedBy(userId, pageable).map(this::toResponse);
    }

    // ── Status update (workflow enforcement) ─────────────────────────────────

    public TicketResponse updateStatus(Long id, UpdateTicketStatusRequest request,
                                       String updatedByRole) {
        Ticket ticket = findTicket(id);
        validateStatusTransition(ticket.getStatus(), request.getStatus(), updatedByRole);

        ticket.setStatus(request.getStatus());

        if (request.getResolutionNotes() != null) {
            ticket.setResolutionNotes(request.getResolutionNotes());
        }
        if (request.getRejectionReason() != null) {
            ticket.setRejectionReason(request.getRejectionReason());
        }
        if (request.getStatus() == TicketStatus.RESOLVED) {
            ticket.setResolvedAt(LocalDateTime.now());
        }

        return toResponse(ticketRepository.save(ticket));
    }

    // ── Assign technician ─────────────────────────────────────────────────────

    public TicketResponse assignTechnician(Long id, AssignTechnicianRequest request) {
        Ticket ticket = findTicket(id);
        ticket.setAssignedTechnicianId(request.getTechnicianId());
        ticket.setAssignedTechnicianName(request.getTechnicianName());
        // Auto-move to IN_PROGRESS when technician is assigned
        if (ticket.getStatus() == TicketStatus.OPEN) {
            ticket.setStatus(TicketStatus.IN_PROGRESS);
        }
        return toResponse(ticketRepository.save(ticket));
    }

    // ── Delete (admin only, enforced at controller level) ─────────────────────

    public void deleteTicket(Long id) {
        if (!ticketRepository.existsById(id)) {
            throw new ResourceNotFoundException("Ticket not found with id: " + id);
        }
        ticketRepository.deleteById(id);
    }

    // ── Attachments ───────────────────────────────────────────────────────────

    public TicketResponse addAttachments(Long id, List<MultipartFile> files) {
    Ticket ticket = findTicket(id);

    if (ticket.getAttachmentPaths() == null) {
        ticket.setAttachmentPaths(new ArrayList<>());
    }

    int currentCount = ticket.getAttachmentPaths().size();

    if (currentCount + files.size() > 3) {
        throw new BadRequestException("Maximum 3 attachments allowed");
    }

    for (MultipartFile file : files) {
        validateFile(file);

        String savedPath = saveFile(file, id);

        if (savedPath == null) {
            throw new BadRequestException("File saving failed");
        }

        ticket.getAttachmentPaths().add(savedPath);
    }

    Ticket saved = ticketRepository.saveAndFlush(ticket);

    return toResponse(saved);
}

    // ── Comments ──────────────────────────────────────────────────────────────

    public CommentResponse addComment(Long ticketId, AddCommentRequest request,
                                      String authorId, String authorName) {
        Ticket ticket = findTicket(ticketId);
        TicketComment comment = new TicketComment();
        comment.setContent(request.getContent());
        comment.setAuthorId(authorId);
        comment.setAuthorName(authorName);
        comment.setTicket(ticket);
        return toCommentResponse(commentRepository.save(comment));
    }

    public CommentResponse updateComment(Long ticketId, Long commentId,
                                         AddCommentRequest request, String requesterId) {
        findTicket(ticketId); // ensures ticket exists
        TicketComment comment = commentRepository.findByIdAndAuthorId(commentId, requesterId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Comment not found or you are not the author"));
        comment.setContent(request.getContent());
        return toCommentResponse(commentRepository.save(comment));
    }

    public void deleteComment(Long ticketId, Long commentId, String requesterId, boolean isAdmin) {
        findTicket(ticketId);
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        if (!isAdmin && !comment.getAuthorId().equals(requesterId)) {
            throw new BadRequestException("You can only delete your own comments");
        }
        commentRepository.delete(comment);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Ticket findTicket(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));
    }

    private void validateStatusTransition(TicketStatus current, TicketStatus next, String role) {
        // Admins can set REJECTED from any state
        if ("ADMIN".equals(role) && next == TicketStatus.REJECTED) return;

        boolean valid = switch (current) {
            case OPEN        -> next == TicketStatus.IN_PROGRESS || next == TicketStatus.REJECTED;
            case IN_PROGRESS -> next == TicketStatus.RESOLVED   || next == TicketStatus.REJECTED;
            case RESOLVED    -> next == TicketStatus.CLOSED;
            case CLOSED, REJECTED -> false; // terminal states
        };
        if (!valid) {
            throw new BadRequestException(
                    "Invalid status transition: " + current + " → " + next);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) throw new BadRequestException("File cannot be empty");
        if (file.getSize() > MAX_FILE_SIZE) throw new BadRequestException("File exceeds 5 MB limit");
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new BadRequestException("Only JPEG, PNG, GIF and WEBP images are allowed");
        }
    }

    private String saveFile(MultipartFile file, Long ticketId) {
        try {
            Path dirPath = Paths.get(uploadDir, String.valueOf(ticketId));
            Files.createDirectories(dirPath);
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = dirPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            return filePath.toString();
        } catch (IOException e) {
            throw new BadRequestException("Failed to save file: " + e.getMessage());
        }
    }

    // ── Mappers ───────────────────────────────────────────────────────────────

    private TicketResponse toResponse(Ticket t) {
        TicketResponse r = new TicketResponse();
        r.setId(t.getId());
        r.setTitle(t.getTitle());
        r.setDescription(t.getDescription());
        r.setCategory(t.getCategory());
        r.setPriority(t.getPriority());
        r.setStatus(t.getStatus());
        r.setResourceId(t.getResourceId());
        r.setLocation(t.getLocation());
        r.setPreferredContact(t.getPreferredContact());
        r.setCreatedBy(t.getCreatedBy());
        r.setAssignedTechnicianId(t.getAssignedTechnicianId());
        r.setAssignedTechnicianName(t.getAssignedTechnicianName());
        r.setResolutionNotes(t.getResolutionNotes());
        r.setRejectionReason(t.getRejectionReason());
        r.setAttachmentPaths(
    t.getAttachmentPaths() != null
        ? t.getAttachmentPaths()
        : new java.util.ArrayList<>()
);
        r.setComments(
         t.getComments() != null
        ? t.getComments().stream().map(this::toCommentResponse).collect(Collectors.toList())
        : new java.util.ArrayList<>()
        );
        r.setCreatedAt(t.getCreatedAt());
        r.setUpdatedAt(t.getUpdatedAt());
        r.setResolvedAt(t.getResolvedAt());
        return r;
    }

    private CommentResponse toCommentResponse(TicketComment c) {
        CommentResponse r = new CommentResponse();
        r.setId(c.getId());
        r.setContent(c.getContent());
        r.setAuthorId(c.getAuthorId());
        r.setAuthorName(c.getAuthorName());
        r.setCreatedAt(c.getCreatedAt());
        r.setUpdatedAt(c.getUpdatedAt());
        return r;
    }
}