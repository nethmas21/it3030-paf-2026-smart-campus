package com.example.demo.service;

import com.example.demo.dto.response.BookingResponse;
import com.example.demo.enums.BookingStatus;
import com.example.demo.enums.NotificationType;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class BookingNotificationAspect {

    private final NotificationService notificationService;

    public BookingNotificationAspect(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @Around("execution(* com.example.demo.service.BookingService.approveBooking(..))")
    public Object notifyBookingApproved(ProceedingJoinPoint joinPoint) throws Throwable {
        Object result = joinPoint.proceed();

        if (result instanceof BookingResponse booking) {
            notificationService.createNotification(
                    booking.getRequestedBy(),
                    buildMessage(booking, BookingStatus.APPROVED),
                    NotificationType.BOOKING
            );
        }

        return result;
    }

    @Around("execution(* com.example.demo.service.BookingService.rejectBooking(..))")
    public Object notifyBookingRejected(ProceedingJoinPoint joinPoint) throws Throwable {
        Object result = joinPoint.proceed();

        if (result instanceof BookingResponse booking) {
            notificationService.createNotification(
                    booking.getRequestedBy(),
                    buildMessage(booking, BookingStatus.REJECTED),
                    NotificationType.BOOKING
            );
        }

        return result;
    }

    private String buildMessage(BookingResponse booking, BookingStatus status) {
        String baseMessage = "Booking #" + booking.getId() + " was " + status.name().toLowerCase();

        if (booking.getDecisionReason() == null || booking.getDecisionReason().isBlank()) {
            return baseMessage;
        }

        return baseMessage + ": " + booking.getDecisionReason();
    }
}
