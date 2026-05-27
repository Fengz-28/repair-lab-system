import { InventoryMovementType } from "@prisma/client";

export function calculateInventoryQuantity(input: {
  currentQuantity: number;
  movementType: InventoryMovementType;
  quantity: number;
}) {
  if (input.quantity <= 0) {
    throw new Error("La cantidad debe ser mayor a cero.");
  }

  const nextQuantity =
    input.movementType === InventoryMovementType.OUT
      ? input.currentQuantity - input.quantity
      : input.currentQuantity + input.quantity;

  if (nextQuantity < 0) {
    throw new Error("No hay stock suficiente para registrar esta salida.");
  }

  return nextQuantity;
}
