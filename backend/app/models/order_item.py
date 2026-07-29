from sqlalchemy import Column, Integer, String, Numeric, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)

    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    product_name = Column(String(150), nullable=False)
    product_image = Column(String(255), nullable=True)
    # The unit this line was actually transacted in — may be the
    # product's primary unit or its configured sub-unit (e.g. "pc" from
    # a "box"). Snapshotted so past orders read correctly even if the
    # product's unit config later changes.
    product_unit = Column(String(20), nullable=True)

    quantity = Column(Numeric(14, 4), nullable=False)
    price = Column(Numeric(10, 2), nullable=False)  # per product_unit, at order time

    # The same quantity expressed in the product's primary selling unit
    # at the moment of sale — used to restock correctly on cancellation
    # without depending on the product's *current* sub_unit_ratio.
    selling_unit_quantity = Column(Numeric(14, 4), nullable=True)

    order = relationship("Order", back_populates="items")