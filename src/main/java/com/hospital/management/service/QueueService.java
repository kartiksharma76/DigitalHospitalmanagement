package com.hospital.management.service;

import com.hospital.management.model.Appointment;
import com.hospital.management.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class QueueService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    /**
     * Calculates and assigns a token number to a patient for a doctor's queue on a given date.
     * Estimated wait time is based on token position (approx. 15 minutes per patient in queue).
     */
    public Appointment addToQueue(Appointment appointment) {
        List<Appointment> dailyAppointments = appointmentRepository.findByDoctorIdAndDate(
                appointment.getDoctor().getId(), appointment.getDate());
        
        int currentQueueSize = (int) dailyAppointments.stream()
                .filter(a -> "Scheduled".equals(a.getStatus()) || "In_Queue".equals(a.getStatus()))
                .count();

        int token = currentQueueSize + 1;
        int waitTime = currentQueueSize * 15; // 15 mins average per patient

        appointment.setTokenNumber(token);
        appointment.setEstimatedWaitMinutes(waitTime);
        appointment.setStatus("In_Queue");
        
        return appointmentRepository.save(appointment);
    }

    /**
     * Recalculates wait times for all scheduled and queued appointments for a doctor on a specific day.
     */
    public void refreshWaitTimes(Long doctorId, String date) {
        List<Appointment> activeQueue = appointmentRepository.findByDoctorIdAndDate(doctorId, date);
        activeQueue.sort((a1, a2) -> Integer.compare(a1.getTokenNumber(), a2.getTokenNumber()));

        int count = 0;
        for (Appointment appt : activeQueue) {
            if ("In_Queue".equals(appt.getStatus())) {
                appt.setEstimatedWaitMinutes(count * 12); // Speed up estimation dynamically
                appointmentRepository.save(appt);
                count++;
            }
        }
    }
}
