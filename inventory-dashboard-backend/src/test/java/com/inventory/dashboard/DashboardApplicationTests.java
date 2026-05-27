package com.inventory.dashboard;

import com.inventory.dashboard.service.MovementsService;
import com.inventory.dashboard.model.StockMovement;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class DashboardApplicationTests {

    @Autowired
    private MovementsService movementsService;

    @Test
    void testLoadAllReturnsData() throws Exception {
        List<StockMovement> movements = movementsService.loadAll();
        assertNotNull(movements);
        assertFalse(movements.isEmpty(), "Seed data should not be empty");
    }

    @Test
    void testSha256VerificationSuccess() throws Exception {
        String sample = "[{\"id\":\"mv1001\",\"timestamp\":\"2026-03-10T17:46:00Z\",\"sku\":\"SKU003\",\"movementType\":\"IN\",\"quantity\":48}]";
        byte[] bytes = sample.getBytes(StandardCharsets.UTF_8);

        // Compute expected hash independently
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        String expected = HexFormat.of().formatHex(digest.digest(bytes));

        assertTrue(movementsService.verifySha256(bytes, expected));
    }

    @Test
    void testSha256VerificationFailure() throws Exception {
        byte[] bytes = "some json content".getBytes(StandardCharsets.UTF_8);
        assertFalse(movementsService.verifySha256(bytes, "deadbeefdeadbeef"));
    }

    @Test
    void testFilterByMovementType() throws Exception {
        List<StockMovement> inOnly = movementsService.filter(null, null, "IN", null);
        assertTrue(inOnly.stream().allMatch(m -> "IN".equals(m.getMovementType())),
                "All filtered records should be of type IN");

        List<StockMovement> outOnly = movementsService.filter(null, null, "OUT", null);
        assertTrue(outOnly.stream().allMatch(m -> "OUT".equals(m.getMovementType())),
                "All filtered records should be of type OUT");
    }


    @Test
    void testFilterByDateRange() throws Exception {
        List<StockMovement> all = movementsService.loadAll();
        List<StockMovement> filtered = movementsService.filter("2026-01-01", "2026-03-31", null, null);

        assertTrue(filtered.size() <= all.size());

        for (StockMovement m : filtered) {
            String date = m.getTimestamp().substring(0, 10);
            assertTrue(date.compareTo("2026-01-01") >= 0);
            assertTrue(date.compareTo("2026-03-31") <= 0);
        }
    }
}
