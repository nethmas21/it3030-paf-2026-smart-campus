package com.example.demo.repository;



import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.Ticket;
import com.example.demo.enums.TicketCategory;
import com.example.demo.enums.TicketPriority;
import com.example.demo.enums.TicketStatus;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    // Get all tickets by a specific user
    Page<Ticket> findByCreatedBy(String createdBy, Pageable pageable);

    // Get all tickets assigned to a technician
    Page<Ticket> findByAssignedTechnicianId(String technicianId, Pageable pageable);

    // Admin: filter by status
    Page<Ticket> findByStatus(TicketStatus status, Pageable pageable);

    // Admin: filter by category
    Page<Ticket> findByCategory(TicketCategory category, Pageable pageable);

    // Admin: filter by priority
    Page<Ticket> findByPriority(TicketPriority priority, Pageable pageable);

    // Combined filter query for admin dashboard
    @Query("SELECT t FROM Ticket t WHERE " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:category IS NULL OR t.category = :category) AND " +
           "(:priority IS NULL OR t.priority = :priority) AND " +
           "(:createdBy IS NULL OR t.createdBy = :createdBy)")
    Page<Ticket> findWithFilters(
            @Param("status") TicketStatus status,
            @Param("category") TicketCategory category,
            @Param("priority") TicketPriority priority,
            @Param("createdBy") String createdBy,
            Pageable pageable
    );

    // Count open tickets per location for analytics
    @Query("SELECT t.location, COUNT(t) FROM Ticket t WHERE t.status = 'OPEN' ")
    java.util.List<Object[]> countOpenTicketsByLocation();
}