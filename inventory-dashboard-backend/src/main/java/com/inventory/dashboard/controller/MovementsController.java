package com.inventory.dashboard.controller;

import com.inventory.dashboard.model.StockMovement;
import com.inventory.dashboard.service.MovementsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

//   GET  /api/movements      – filtered movement records
//  POST /api/verify-file    – SHA-256 validation + data ingestion
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class MovementsController {

    private final MovementsService movementsService;

    public MovementsController(MovementsService movementsService) {
        this.movementsService = movementsService;
    }

    @GetMapping("/movements")
    public ResponseEntity<?> getMovements(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String warehouse) {

        try {
            List<StockMovement> results = movementsService.filter(from, to, type, warehouse);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to load movements: " + e.getMessage()));
        }
    }

    @PostMapping("/verify-file")
    public ResponseEntity<?> verifyFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("sha256") String sha256) {

        try {
            byte[] bytes = file.getBytes();

//             SHA-256 check
            boolean valid = movementsService.verifySha256(bytes, sha256);
            if (!valid) {
                return ResponseEntity.badRequest().body(Map.of(
                        "valid", false,
                        "message", "SHA-256 digest mismatch. The file may be corrupted or tampered."
                ));
            }

            List<StockMovement> movements = movementsService.parseAndPersist(bytes);

            return ResponseEntity.ok(Map.of(
                    "valid", true,
                    "message", "File verified and loaded successfully.",
                    "count", movements.size(),
                    "movements", movements
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "valid", false,
                    "message", "Server error during verification: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/warehouses")
    public ResponseEntity<?> getWarehouses() {
        try {
            List<StockMovement> all = movementsService.loadAll();

            List<String> warehouses = new ArrayList<>();
            for (StockMovement movement : all) {
                String warehouse = movement.getWarehouse();
                if (warehouse != null && !warehouse.isBlank() && !warehouses.contains(warehouse)) {
                    warehouses.add(warehouse);
                }
            }

            Collections.sort(warehouses);
            return ResponseEntity.ok(warehouses);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to load warehouses: " + e.getMessage()));
        }
    }
}
