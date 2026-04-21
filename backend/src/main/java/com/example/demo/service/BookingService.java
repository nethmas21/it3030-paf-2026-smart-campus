package com.example.demo.service;

import com.example.demo.dto.request.BookingDecisionRequest;
import com.example.demo.dto.request.CreateBookingRequest;
import com.example.demo.dto.response.BookingResponse;
import com.example.demo.entity.Booking;
import com.example.demo.enums.BookingStatus;
import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.BookingRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalTime;

@Service
@Transactional
public class BookingService {

    private final BookingRepository bookingRepository;

    public BookingService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    public BookingResponse createBooking(CreateBookingRequest request, String userId) {
        validateTimeRange(request.getStartTime(), request.getEndTime());

        Booking booking = new Booking();
        booking.setResourceId(request.getResourceId());
        booking.setBookingDate(request.getBookingDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setExpectedAttendees(request.getExpectedAttendees());
        booking.setRequestedBy(userId);
        booking.setStatus(BookingStatus.PENDING);

        return toResponse(bookingRepository.save(booking));
    }

    public Page<BookingResponse> getMyBookings(String userId, Pageable pageable) {
        return bookingRepository.findByRequestedBy(userId, pageable)
                .map(this::toResponse);
    }

    public Page<BookingResponse> getAllBookings(BookingStatus status, Pageable pageable) {
        if (status != null) {
            return bookingRepository.findByStatus(status, pageable)
                    .map(this::toResponse);
        }

        return bookingRepository.findAll(pageable)
                .map(this::toResponse);
    }

    public BookingResponse getBookingById(Long id) {
        return toResponse(findBooking(id));
    }

    public BookingResponse approveBooking(Long id, BookingDecisionRequest request) {
        Booking booking = findBooking(id);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only pending bookings can be approved");
        }

        boolean conflict = bookingRepository.existsApprovedConflict(
                booking.getResourceId(),
                booking.getBookingDate(),
                booking.getStartTime(),
                booking.getEndTime()
        );

        if (conflict) {
            throw new BadRequestException("Booking conflict detected for this resource and time range");
        }

        booking.setStatus(BookingStatus.APPROVED);
        if (request != null) {
            booking.setDecisionReason(request.getReason());
        }

        return toResponse(bookingRepository.save(booking));
    }

    public BookingResponse rejectBooking(Long id, BookingDecisionRequest request) {
        Booking booking = findBooking(id);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only pending bookings can be rejected");
        }

        booking.setStatus(BookingStatus.REJECTED);
        if (request != null) {
            booking.setDecisionReason(request.getReason());
        }

        return toResponse(bookingRepository.save(booking));
    }

    public BookingResponse cancelBooking(Long id, String userId, boolean isAdmin) {
        Booking booking = findBooking(id);

        if (!isAdmin && !booking.getRequestedBy().equals(userId)) {
            throw new BadRequestException("You can only cancel your own approved bookings");
        }

        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new BadRequestException("Only approved bookings can be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);

        return toResponse(bookingRepository.save(booking));
    }

    private Booking findBooking(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
    }

    private void validateTimeRange(LocalTime startTime, LocalTime endTime) {
        if (startTime == null || endTime == null || !startTime.isBefore(endTime)) {
            throw new BadRequestException("Start time must be before end time");
        }
    }

    private BookingResponse toResponse(Booking booking) {
        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        response.setResourceId(booking.getResourceId());
        response.setBookingDate(booking.getBookingDate());
        response.setStartTime(booking.getStartTime());
        response.setEndTime(booking.getEndTime());
        response.setPurpose(booking.getPurpose());
        response.setExpectedAttendees(booking.getExpectedAttendees());
        response.setStatus(booking.getStatus());
        response.setRequestedBy(booking.getRequestedBy());
        response.setDecisionReason(booking.getDecisionReason());
        response.setCreatedAt(booking.getCreatedAt());
        response.setUpdatedAt(booking.getUpdatedAt());
        return response;
    }
}