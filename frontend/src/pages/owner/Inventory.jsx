import { Boxes } from "lucide-react";
import ComingSoon from "../../components/common/ComingSoon";

export default function Inventory() {
  return (
    <ComingSoon
      icon={Boxes}
      title="Inventory tracking"
      phase="Phase 8"
      description="Update stock counts, get low-stock warnings, and see a history of stock changes over time."
    />
  );
}
