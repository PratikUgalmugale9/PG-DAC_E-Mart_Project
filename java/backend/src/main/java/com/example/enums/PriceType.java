package com.example.enums;

/**
 * Defines the pricing type used for a cart item.
 * MRP = Standard retail price (for non-loyalty users or by choice)
 * LOYALTY = Cardholder discounted price
 * POINTS = Paid using loyalty points
 */
public enum PriceType {
    MRP,
    LOYALTY,
    POINTS
}
