package com.mealmap.model.embedded;

import com.mealmap.model.enums.Unit;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Embeddable
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Quantity {

    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    private Unit unit;
}
