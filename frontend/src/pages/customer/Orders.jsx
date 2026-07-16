import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { ClipboardList } from "lucide-react";
import Spinner from "../../components/common/Spinner";
import Button from "../../components/common/Button";
import ComingSoon from "../../components/common/ComingSoon";
import OrderCard from "../../components/order/OrderCard";
import { fetchMyOrders } from "../../services/orderService";

export default function Orders() {
  const location = useLocation();
  const justPlacedOrderId = location.state?.justPlacedOrderId;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMyOrders()
      .then(setOrders)
      .catch(() => setError("Couldn't load your orders. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">Your orders</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Track your pre-orders from placed to ready for pickup.
        </p>
      </div>

      {justPlacedOrderId && (
        <p className="rounded-lg bg-[var(--color-storefront)]/10 px-3 py-2 text-sm text-[var(--color-storefront)]">
          Order #{justPlacedOrderId} placed! The store will confirm it shortly.
        </p>
      )}

      {error && (
        <p className="rounded-lg bg-[var(--color-crate)]/10 px-3 py-2 text-sm text-[var(--color-crate)]" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <Spinner label="Loading your orders…" />
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center gap-4">
          <ComingSoon
            icon={ClipboardList}
            title="No orders yet"
            description="Once you place a pre-order, you can track its status here."
          />
          <Link to="/products">
            <Button variant="secondary">Browse products</Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
