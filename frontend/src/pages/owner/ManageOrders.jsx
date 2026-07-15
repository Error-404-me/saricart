import { ClipboardList } from "lucide-react";
import ComingSoon from "../../components/common/ComingSoon";

export default function ManageOrders() {
  return (
    <ComingSoon
      icon={ClipboardList}
      title="Order queue"
      phase="Phase 7"
      description="Review incoming pre-orders, accept or reject them, and move them through preparing, ready-for-pickup, and completed."
    />
  );
}
