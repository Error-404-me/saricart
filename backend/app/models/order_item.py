from sqlalchemy import Column, Integer, String, Numeric, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)

    # Nullable + no snapshot dependency on the live row: if a product is
    # later edited or deleted, past orders should still read correctly, so
    # name/image are captured at order time below rather than joined live.
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    product_name = Column(String(150), nullable=False)
    product_image = Column(String(255), nullable=True)

    quantity = Column(Integer, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)  # unit price at order time

    order = relationship("Order", back_populates="items")
