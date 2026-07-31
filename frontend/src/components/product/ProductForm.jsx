import { useCallback, useState } from "react";
import { ImagePlus, ScanBarcode, Camera } from "lucide-react";
import Input from "../common/Input";
import Button from "../common/Button";
import Modal from "../common/Modal";
import BarcodeScanner from "../scanner/BarcodeScanner";
import {
  PRODUCT_UNITS,
  UNIT_HIERARCHY,
  getUnitConfig,
} from "../../constants/units";
import { formatCurrency } from "../../utils/formatCurrency";

const CURRENT_CATEGORIES_HINT =
  "e.g. Snacks, Instant Noodles, Beverages, Canned Goods";

export default function ProductForm({
  initialValues = {},
  initialImageUrl = null,
  onSubmit,
  submitLabel = "Save product",
  submitting = false,
  formError = "",
}) {
  const [form, setForm] = useState({
    name: initialValues.name || "",
    description: initialValues.description || "",
    category: initialValues.category || "",
    price: initialValues.price ?? "",
    unit: initialValues.unit || "pc",
    stock: initialValues.stock ?? "",
    sellByBaseUnit: !!initialValues.sub_unit,
    subUnitRatio:
      initialValues.sub_unit_ratio != null
        ? String(initialValues.sub_unit_ratio)
        : "",
    barcode: initialValues.barcode || "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialImageUrl);
  const [fieldErrors, setFieldErrors] = useState({});
  const [scannerOpen, setScannerOpen] = useState(false);

  const unitConfig = getUnitConfig(form.unit);
  const hierarchyEntry = UNIT_HIERARCHY[form.unit];

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // Changing the primary unit resets sub-unit config, since a ratio
  // configured for one unit family (e.g. "24 pcs per box") is
  // meaningless once the owner switches to a different unit (e.g. "kg").
  function handleUnitChange(e) {
    setForm((prev) => ({
      ...prev,
      unit: e.target.value,
      sellByBaseUnit: false,
      subUnitRatio: "",
    }));
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function validate() {
    const errors = {};
    if (!form.name.trim()) errors.name = "Give the product a name.";

    const price = parseFloat(form.price);
    if (Number.isNaN(price) || price <= 0) {
      errors.price = "Enter a price greater than 0.";
    }

    const stock = parseFloat(form.stock);
    if (Number.isNaN(stock) || stock < 0) {
      errors.stock = "Enter a stock amount of 0 or more.";
    } else if (
      !unitConfig.allowsDecimal &&
      !form.sellByBaseUnit &&
      !Number.isInteger(stock)
    ) {
      errors.stock = `Whole numbers only for ${unitConfig.fullLabel.toLowerCase()}.`;
    }

    if (form.sellByBaseUnit && hierarchyEntry && !hierarchyEntry.fixedRatio) {
      const ratio = parseFloat(form.subUnitRatio);
      const subLabel = getUnitConfig(hierarchyEntry.subUnit).label;
      if (Number.isNaN(ratio) || ratio <= 0) {
        errors.subUnitRatio = `Enter how many ${subLabel} per ${form.unit}.`;
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    const subUnit =
      form.sellByBaseUnit && hierarchyEntry ? hierarchyEntry.subUnit : null;
    const subUnitRatio = subUnit
      ? (hierarchyEntry.fixedRatio ?? parseFloat(form.subUnitRatio))
      : null;

    onSubmit({
      name: form.name.trim(),
      description: form.description.trim() || null,
      category: form.category.trim() || null,
      price: parseFloat(form.price),
      unit: form.unit,
      stock: parseFloat(form.stock),
      sub_unit: subUnit,
      sub_unit_ratio: subUnitRatio,
      barcode: form.barcode.trim() || null,
      imageFile,
    });
  }

  const handleScanned = useCallback((code) => {
    setForm((prev) => ({ ...prev, barcode: code }));
    setScannerOpen(false);
  }, []);

  const previewSubUnitPrice = (() => {
    if (!form.sellByBaseUnit || !hierarchyEntry) return null;
    const ratio = hierarchyEntry.fixedRatio ?? parseFloat(form.subUnitRatio);
    const price = parseFloat(form.price);
    if (!ratio || ratio <= 0 || Number.isNaN(price) || price <= 0) return null;
    return price / ratio;
  })();

  return (
    <>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-paper)]">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Product preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <ImagePlus className="h-6 w-6 text-[var(--color-muted)]" />
            )}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            <label className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-[var(--color-storefront)] hover:underline">
              <Camera className="h-4 w-4" />
              Take photo
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                onChange={handleImageChange}
                className="sr-only"
              />
            </label>
            <label className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-[var(--color-storefront)] hover:underline">
              <ImagePlus className="h-4 w-4" />
              {imagePreview ? "Change photo" : "Upload photo"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="sr-only"
              />
            </label>
          </div>
        </div>

        <Input
          id="name"
          name="name"
          label="Product name"
          placeholder="Lucky Me Pancit Canton"
          value={form.name}
          onChange={handleChange}
          error={fieldErrors.name}
        />

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="description"
            className="text-sm font-medium text-[var(--color-ink)]"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            placeholder="Chilimansi flavor, 60g pack"
            value={form.description}
            onChange={handleChange}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] outline-none transition
              placeholder:text-[var(--color-muted)]/60
              focus:border-[var(--color-storefront)] focus:ring-2 focus:ring-[var(--color-storefront)]/20"
          />
        </div>

        <Input
          id="category"
          name="category"
          label="Category"
          placeholder={CURRENT_CATEGORIES_HINT}
          value={form.category}
          onChange={handleChange}
        />

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="unit"
            className="text-sm font-medium text-[var(--color-ink)]"
          >
            Unit of sale
          </label>
          <select
            id="unit"
            name="unit"
            value={form.unit}
            onChange={handleUnitChange}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] outline-none transition
              focus:border-[var(--color-storefront)] focus:ring-2 focus:ring-[var(--color-storefront)]/20"
          >
            {PRODUCT_UNITS.map((u) => (
              <option key={u.value} value={u.value}>
                {u.fullLabel} ({u.label})
              </option>
            ))}
          </select>
        </div>

        {hierarchyEntry && (
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-paper)] p-3.5">
            <label className="flex items-center gap-2.5 text-sm font-medium text-[var(--color-ink)]">
              <input
                type="checkbox"
                checked={form.sellByBaseUnit}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    sellByBaseUnit: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-[var(--color-border)]"
              />
              Also sell by the{" "}
              {getUnitConfig(hierarchyEntry.subUnit).fullLabel.toLowerCase()}
            </label>
            <p className="mt-1 pl-[26px] text-xs text-[var(--color-muted)]">
              Lets customers buy a single{" "}
              {getUnitConfig(hierarchyEntry.subUnit).label} instead of a whole{" "}
              {unitConfig.fullLabel.toLowerCase()} — e.g. 1kg out of a 25kg
              sack.
            </p>

            {form.sellByBaseUnit && (
              <>
                {hierarchyEntry.fixedRatio ? (
                  <p className="mt-2 pl-[26px] text-xs text-[var(--color-muted)]">
                    Fixed: 1 {form.unit} = {hierarchyEntry.fixedRatio}{" "}
                    {getUnitConfig(hierarchyEntry.subUnit).label}
                  </p>
                ) : (
                  <div className="mt-2.5 pl-[26px]">
                    <Input
                      id="subUnitRatio"
                      name="subUnitRatio"
                      type="number"
                      min="0"
                      step="1"
                      label={`How many ${getUnitConfig(hierarchyEntry.subUnit).label} per ${form.unit}?`}
                      placeholder="e.g. 24"
                      value={form.subUnitRatio}
                      onChange={handleChange}
                      error={fieldErrors.subUnitRatio}
                    />
                  </div>
                )}

                {previewSubUnitPrice != null && (
                  <p className="mt-2.5 pl-[26px] text-xs font-medium text-[var(--color-storefront)]">
                    = {formatCurrency(previewSubUnitPrice)} per{" "}
                    {getUnitConfig(hierarchyEntry.subUnit).label} — this is what
                    customers will pay per{" "}
                    {getUnitConfig(hierarchyEntry.subUnit).singularLabel ||
                      getUnitConfig(hierarchyEntry.subUnit).label}
                  </p>
                )}
              </>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            label={`Price (₱ per ${unitConfig.label})`}
            placeholder="15.50"
            value={form.price}
            onChange={handleChange}
            error={fieldErrors.price}
          />
          <Input
            id="stock"
            name="stock"
            type="number"
            step={unitConfig.allowsDecimal || form.sellByBaseUnit ? 0.01 : 1}
            min="0"
            label={`Stock (${unitConfig.label})`}
            placeholder={
              unitConfig.allowsDecimal || form.sellByBaseUnit ? "25" : "40"
            }
            value={form.stock}
            onChange={handleChange}
            error={fieldErrors.stock}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="barcode"
            className="text-sm font-medium text-[var(--color-ink)]"
          >
            Barcode
          </label>
          <div className="flex gap-2">
            <input
              id="barcode"
              name="barcode"
              value={form.barcode}
              onChange={handleChange}
              placeholder="e.g. 4801988712345"
              className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] outline-none transition
                placeholder:text-[var(--color-muted)]/60
                focus:border-[var(--color-storefront)] focus:ring-2 focus:ring-[var(--color-storefront)]/20"
            />
            <Button
              type="button"
              variant="ghost"
              onClick={() => setScannerOpen(true)}
              className="shrink-0 gap-1.5"
            >
              <ScanBarcode className="h-4 w-4" />
              Scan
            </Button>
          </div>
        </div>

        {formError && (
          <p
            className="rounded-lg bg-[var(--color-crate)]/10 px-3 py-2 text-sm text-[var(--color-crate)]"
            role="alert"
          >
            {formError}
          </p>
        )}

        <Button
          type="submit"
          loading={submitting}
          className="mt-1 w-full sm:w-auto"
        >
          {submitLabel}
        </Button>
      </form>

      <Modal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        title="Scan barcode"
      >
        {scannerOpen && <BarcodeScanner onScan={handleScanned} />}
      </Modal>
    </>
  );
}
