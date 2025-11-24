package com.mealmap.controller;

import com.mealmap.model.dto.planner.CreatePlannerWeekRequest;
import com.mealmap.model.dto.planner.PlannerWeekDto;
import com.mealmap.model.dto.planner.PlannerWeekPageResponse;
import com.mealmap.model.dto.planner.UpdatePlannerWeekRequest;
import com.mealmap.service.PlannerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/planner/weeks")
@RequiredArgsConstructor
public class PlannerController {

    private final PlannerService plannerService;

    @GetMapping
    public ResponseEntity<PlannerWeekPageResponse> getPlannerWeeks(
            @RequestParam(name = "from", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(name = "to", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(name = "limit", required = false) Integer limit,
            @RequestParam(name = "cursor", required = false) String cursor) {
        PlannerWeekPageResponse response = plannerService.getPlannersWeeks(from, to, limit, cursor);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlannerWeekDto> getPlannerWeekById(@PathVariable UUID id) {
        PlannerWeekDto plannerWeek = plannerService.getPlannerWeekById(id);
        return ResponseEntity.ok(plannerWeek);
    }

    @PostMapping
    public ResponseEntity<PlannerWeekDto> createPlannerWeek(@Valid @RequestBody CreatePlannerWeekRequest request) {
        PlannerWeekDto plannerWeek = plannerService.createPlannerWeek(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(plannerWeek);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<PlannerWeekDto> updatePlannerWeek(
            @PathVariable UUID id,
            @Valid @RequestBody UpdatePlannerWeekRequest request) {
        PlannerWeekDto plannerWeek = plannerService.updatePlannerWeek(id, request);
        return ResponseEntity.ok(plannerWeek);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlannerWeek(@PathVariable UUID id) {
        plannerService.deletePlannerWeek(id);
        return ResponseEntity.noContent().build();
    }
}
