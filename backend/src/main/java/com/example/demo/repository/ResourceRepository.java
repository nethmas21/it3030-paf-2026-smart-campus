package com.example.demo.repository;


import com.example.demo.entity.Resource;
import com.example.demo.enums.ResourceStatus;
import com.example.demo.enums.ResourceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ResourceRepository extends JpaRepository<Resource, Long> {

    List<Resource> findByType(ResourceType type);

    List<Resource> findByStatus(ResourceStatus status);

    List<Resource> findByLocation(String location);

    List<Resource> findByCapacityGreaterThanEqual(Integer capacity);

    @Query("SELECT r FROM Resource r WHERE " +
           "(:type IS NULL OR r.type = :type) AND " +
           "(:location IS NULL OR r.location = :location) AND " +
           "(:minCapacity IS NULL OR r.capacity >= :minCapacity) AND " +
           "(:status IS NULL OR r.status = :status)")
    List<Resource> searchResources(
        @Param("type") ResourceType type,
        @Param("location") String location,
        @Param("minCapacity") Integer minCapacity,
        @Param("status") ResourceStatus status
    );
}