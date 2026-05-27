package com.inventory.dashboard.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.inventory.dashboard.model.StockMovement;
import org.springframework.stereotype.Service;

import java.io.*;
import java.net.URL;
import java.nio.file.*;
import java.security.MessageDigest;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.HexFormat;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Core service for all movement data operations:
 *  - Loading from the persisted JSON file (classpath seed or override file)
 *  - SHA-256 validation of uploaded files
 *  - Filtering by date range, movement type, and warehouse
 *  - Persisting newly uploaded data to override the seed file
 */
@Service
public class MovementsService {

    private static final String OVERRIDE_FILE = "movements_data.json";
    private final ObjectMapper mapper = new ObjectMapper();

    // ─── Data Loading ──────────────────────────────────────────────────────────

    /**
     * Reads the current dataset.
     * Priority: user-uploaded override file → classpath seed file.
     */
    public List<StockMovement> loadAll() throws IOException {
        File override = new File(OVERRIDE_FILE);
        if (override.exists()) {
            return mapper.readValue(override, new TypeReference<>() {});
        }
        // Fall back to bundled seed data
        URL resource = getClass().getClassLoader().getResource("movements.json");
        if (resource == null) {
            throw new FileNotFoundException("movements.json not found in classpath");
        }
        return mapper.readValue(resource, new TypeReference<>() {});
    }

    // ─── Filtering ─────────────────────────────────────────────────────────────

    /**
     * Applies date-range, movement-type, and warehouse filters to the full dataset.
     *
     * @param from      start date inclusive (YYYY-MM-DD), may be null
     * @param to        end date inclusive  (YYYY-MM-DD), may be null
     * @param type      "IN", "OUT", or null for all
     * @param warehouse warehouse code, or null for all
     */
    public List<StockMovement> filter(String from, String to, String type, String warehouse) throws IOException {
        List<StockMovement> all = loadAll();

        LocalDate fromDate = parseDate(from);
        LocalDate toDate   = parseDate(to);

        return all.stream()
            .filter(m -> {
                // Date filter: compare only the date portion of the ISO timestamp
                String datePart = m.getTimestamp().substring(0, 10); // "YYYY-MM-DD"
                LocalDate movDate;
                try {
                    movDate = LocalDate.parse(datePart);
                } catch (DateTimeParseException e) {
                    return false; // skip malformed records
                }
                if (fromDate != null && movDate.isBefore(fromDate)) return false;
                if (toDate   != null && movDate.isAfter(toDate))   return false;
                return true;
            })
            .filter(m -> type == null || type.isBlank() || type.equalsIgnoreCase("ALL")
                      || m.getMovementType().equalsIgnoreCase(type))
            .filter(m -> warehouse == null || warehouse.isBlank() || warehouse.equalsIgnoreCase("ALL")
                      || warehouse.equalsIgnoreCase(m.getWarehouse()))
            .collect(Collectors.toList());
    }

    // ─── SHA-256 Verification ──────────────────────────────────────────────────

    /**
     * Recomputes the SHA-256 hash of the given file bytes and compares it
     * against the client-provided digest (hex string, case-insensitive).
     *
     * @return true if hashes match
     */
    public boolean verifySha256(byte[] fileBytes, String expectedDigest) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(fileBytes);
        String computed = HexFormat.of().formatHex(hash);
        return computed.equalsIgnoreCase(expectedDigest.trim());
    }

    // ─── Persistence ───────────────────────────────────────────────────────────

    /**
     * Parses uploaded JSON bytes into a list of StockMovement objects,
     * then persists them to the override file so future GET requests use
     * the new dataset.
     *
     * @param jsonBytes raw bytes of the uploaded JSON file
     * @return parsed list of movements
     */
    public List<StockMovement> parseAndPersist(byte[] jsonBytes) throws IOException {
        List<StockMovement> movements = mapper.readValue(jsonBytes, new TypeReference<>() {});
        // Write to override file in the working directory
        Files.write(Path.of(OVERRIDE_FILE), jsonBytes, StandardOpenOption.CREATE,
                    StandardOpenOption.TRUNCATE_EXISTING);
        return movements;
    }

    // ─── Helpers ───────────────────────────────────────────────────────────────

    private LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) return null;
        try {
            return LocalDate.parse(dateStr);
        } catch (DateTimeParseException e) {
            return null;
        }
    }
}
