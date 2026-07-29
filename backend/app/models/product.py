import enum
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


# Units sold by weight/volume/length may be purchased in fractional amounts
# (e.g. 1kg out of a 25kg sack). Count-based units must stay whole numbers.
DECIMAL_ALLOWED_UNITS = {
    ProductUnit.KILOGRAM,
    ProductUnit.GRAM,
    ProductUnit.LITER,
    ProductUnit.MILLILITER,
    ProductUnit.METER,
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
    # 3 decimal places supports gram-level precision on kg/L quantities
    # while still storing whole counts for piece-based units.
    stock = Column(Numeric(12, 3), nullable=False, default=0)

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