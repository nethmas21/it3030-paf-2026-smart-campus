package com.example.demo.service;

import com.example.demo.dto.response.CommentResponse;
import com.example.demo.dto.response.TicketResponse;
import com.example.demo.entity.Ticket;
import com.example.demo.enums.NotificationType;
import com.example.demo.repository.TicketRepository;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class TicketNotificationAspect {

    private final NotificationService notificationService;
    private final TicketRepository ticketRepository;

    public TicketNotificationAspect(NotificationService notificationService,
                                    TicketRepository ticketRepository) {
        this.notificationService = notificationService;
        this.ticketRepository = ticketRepository;
    }

    @Around("execution(* com.example.demo.service.TicketService.updateStatus(..))")
    public Object notifyTicketStatusChange(ProceedingJoinPoint joinPoint) throws Throwable {
        Object result = joinPoint.proceed();
        if (result instanceof TicketResponse ticket) {
            notificationService.createNotification(
                    ticket.getCreatedBy(),
                    "Ticket #" + ticket.getId() + " status changed to " + ticket.getStatus(),
                    NotificationType.TICKET
            );
        }
        return result;
    }

    @Around("execution(* com.example.demo.service.TicketService.addComment(..))")
    public Object notifyTicketComment(ProceedingJoinPoint joinPoint) throws Throwable {
        Object[] args = joinPoint.getArgs();
        Long ticketId = (Long) args[0];
        String authorId = (String) args[2];
        Object result = joinPoint.proceed();

        if (result instanceof CommentResponse) {
            ticketRepository.findById(ticketId)
                    .map(Ticket::getCreatedBy)
                    .filter(ownerId -> !ownerId.equals(authorId))
                    .ifPresent(ownerId -> notificationService.createNotification(
                            ownerId,
                            "New comment on ticket #" + ticketId,
                            NotificationType.COMMENT
                    ));
        }
        return result;
    }
}
