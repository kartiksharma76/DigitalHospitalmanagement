package com.hospital.management.repository;

import com.hospital.management.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    Optional<Appointment> findByAppointmentNumber(String appointmentNumber);
    List<Appointment> findByDate(String date);
    List<Appointment> findByDoctorIdAndDate(Long doctorId, String date);
    List<Appointment> findByPatientId(Long patientId);
}
