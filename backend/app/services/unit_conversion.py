from decimal import Decimal, ROUND_HALF_UP

from fastapi import HTTPException, status

from app.models.product import Product, ProductUnit, DECIMAL_ALLOWED_UNITS

CENTAVO = Decimal("0.01")
STOCK_PRECISION = Decimal("0.0001")


def validate_transaction_quantity(unit: ProductUnit, quantity: Decimal) -> None:
    """Whole-number units (pc, dozen, box, sack, pack, bundle) can't be
    bought fractionally, whether they're the product's primary unit or a
    configured sub-unit."""
    if unit not in DECIMAL_ALLOWED_UNITS and quantity % 1 != 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Quantity must be a whole number for unit '{unit.value}'.",
        )


def resolve_transaction(product: Product, requested_unit: ProductUnit) -> tuple[Decimal, Decimal]:
    """Given the unit a customer wants to buy `product` in, returns
    (unit_price, selling_unit_equivalent_per_one_requested_unit).

    unit_price is rounded to the nearest centavo — same precision as
    every other stored price — so a line's subtotal always exactly
    equals unit_price * quantity.
    """
    if requested_unit == product.unit:
        return product.price, Decimal("1")

    if product.sub_unit and requested_unit == product.sub_unit:
        if not product.sub_unit_ratio or product.sub_unit_ratio <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"'{product.name}' isn't configured to sell by {requested_unit.value}.",
            )
        unit_price = (product.price / product.sub_unit_ratio).quantize(
            CENTAVO, rounding=ROUND_HALF_UP
        )
        return unit_price, Decimal("1") / product.sub_unit_ratio

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=f"'{product.name}' isn't sold by {requested_unit.value}.",
    )


def to_selling_unit_quantity(quantity: Decimal, ratio_to_selling_unit: Decimal) -> Decimal:
    return (quantity * ratio_to_selling_unit).quantize(STOCK_PRECISION, rounding=ROUND_HALF_UP)


def line_total(unit_price: Decimal, quantity: Decimal) -> Decimal:
    return (unit_price * quantity).quantize(CENTAVO, rounding=ROUND_HALF_UP)