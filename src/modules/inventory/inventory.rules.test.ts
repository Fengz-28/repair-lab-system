import { InventoryMovementType } from "@prisma/client";
import { describe, expect, it } from "vitest";

import { calculateInventoryQuantity } from "./inventory.rules";

describe("inventory rules", () => {
  it("increases stock for IN and ADJUSTMENT movements", () => {
    expect(
      calculateInventoryQuantity({
        currentQuantity: 5,
        movementType: InventoryMovementType.IN,
        quantity: 3,
      }),
    ).toBe(8);

    expect(
      calculateInventoryQuantity({
        currentQuantity: 5,
        movementType: InventoryMovementType.ADJUSTMENT,
        quantity: 2,
      }),
    ).toBe(7);
  });

  it("reduces stock for OUT movements", () => {
    expect(
      calculateInventoryQuantity({
        currentQuantity: 5,
        movementType: InventoryMovementType.OUT,
        quantity: 3,
      }),
    ).toBe(2);
  });

  it("prevents negative stock and invalid quantities", () => {
    expect(() =>
      calculateInventoryQuantity({
        currentQuantity: 2,
        movementType: InventoryMovementType.OUT,
        quantity: 3,
      }),
    ).toThrow("No hay stock suficiente para registrar esta salida.");

    expect(() =>
      calculateInventoryQuantity({
        currentQuantity: 2,
        movementType: InventoryMovementType.IN,
        quantity: 0,
      }),
    ).toThrow("La cantidad debe ser mayor a cero.");
  });
});
