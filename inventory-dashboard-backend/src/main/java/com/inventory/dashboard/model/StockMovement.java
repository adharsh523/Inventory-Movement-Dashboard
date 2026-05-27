package com.inventory.dashboard.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
@JsonIgnoreProperties(ignoreUnknown = true)
public class StockMovement {

    private String id;
    private String timestamp;
    private String sku;
    private String movementType;
    private int quantity;
    private String warehouse;

    public StockMovement() {}

    public StockMovement(String id, String timestamp, String sku,
                         String movementType, int quantity, String warehouse) {
        this.id = id;
        this.timestamp = timestamp;
        this.sku = sku;
        this.movementType = movementType;
        this.quantity = quantity;
        this.warehouse = warehouse;
    }


    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public String getMovementType() { return movementType; }
    public void setMovementType(String movementType) { this.movementType = movementType; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public String getWarehouse() { return warehouse; }
    public void setWarehouse(String warehouse) { this.warehouse = warehouse; }
}
