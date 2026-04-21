package com.example.demo.repository;

import com.example.demo.entity.Booking;
import com.example.demo.enums.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.time.LocalTime;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    Page<Booking> findByRequestedBy(String requestedBy, Pageable pageable);

    Page<Booking> findByStatus(BookingStatus status, Pageable pageable);

    @Query("""
        SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END
        FROM Booking b
        WHERE b.resourceId = :resourceId
          AND b.bookingDate = :bookingDate
          AND b.status = 'APPROVED'
          AND b.startTime < :endTime
          AND b.endTime > :startTime
    """)
    boolean existsApprovedConflict(
            Long resourceId,
            LocalDate bookingDate,
            LocalTime startTime,
            LocalTime endTime
    );
}