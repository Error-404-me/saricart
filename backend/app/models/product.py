import enum
from decimal import Decimal
from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Numeric,
    DateTime,
    Enum,
    ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.database import Base


class ProductUnit(str, enum.Enum):
    PIECE = "pc"
    KILOGRAM = "kg"
    GRAM = "g"
    LITER = "L"
    MILLILITER = "ml"
    DOZEN = "dozen"
    PACK = "pack"
    BOX = "box"
    SACK = "sack"
    BUNDLE = "bundle"
    METER = "m"


# Units sold by weight/volume/length may be purchased in fractional
# amounts (e.g. 1kg out of a 25kg sack). Count-based units must stay whole.
DECIMAL_ALLOWED_UNITS = {
    ProductUnit.KILOGRAM,
    ProductUnit.GRAM,
    ProductUnit.LITER,
    ProductUnit.MILLILITER,
    ProductUnit.METER,
}

# Maps a selling unit to the smaller unit it may optionally be broken
# down into for sale (a box sold per piece, a sack sold per kilo).
# fixed_ratio is set for universally fixed conversions (1kg = 1000g);
# for the rest the owner supplies the ratio (e.g. pieces per box).
UNIT_HIERARCHY: dict[ProductUnit, dict] = {
    ProductUnit.SACK: {"sub_unit": ProductUnit.KILOGRAM, "fixed_ratio": None},
    ProductUnit.BOX: {"sub_unit": ProductUnit.PIECE, "fixed_ratio": None},
    ProductUnit.PACK: {"sub_unit": ProductUnit.PIECE, "fixed_ratio": None},
    ProductUnit.BUNDLE: {"sub_unit": ProductUnit.PIECE, "fixed_ratio": None},
    ProductUnit.DOZEN: {"sub_unit": ProductUnit.PIECE, "fixed_ratio": Decimal("12")},
    ProductUnit.KILOGRAM: {"sub_unit": ProductUnit.GRAM, "fixed_ratio": Decimal("1000")},
    ProductUnit.LITER: {"sub_unit": ProductUnit.MILLILITER, "fixed_ratio": Decimal("1000")},
}


class Product(Base):
    __tablename__ = "products"
    __table_args__ = (
        UniqueConstraint("owner_id", "barcode", name="uq_owner_barcode"),
    )

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(80), nullable=True, index=True)
    price = Column(Numeric(10, 2), nullable=False)

    unit = Column(Enum(ProductUnit), nullable=False, default=ProductUnit.PIECE)
    sub_unit = Column(Enum(ProductUnit), nullable=True)
    sub_unit_ratio = Column(Numeric(12, 4), nullable=True)

    # 4 decimal places keeps rounding drift negligible even for awkward
    # sub-unit ratios (e.g. 1/24 box per piece sold).
    stock = Column(Numeric(14, 4), nullable=False, default=0)

    image = Column(String(255), nullable=True)
    barcode = Column(String(64), nullable=True, index=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    owner = relationship("User")

    @property
    def owner_username(self) -> str | None:
        return self.owner.username if self.owner else None