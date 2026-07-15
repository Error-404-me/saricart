import { useState } from "react";
import { ImagePlus } from "lucide-react";
import Input from "../common/Input";
import Button from "../common/Button";

const CURRENT_CATEGORIES_HINT = "e.g. Snacks, Instant Noodles, Beverages, Canned Goods";

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
    stock: initialValues.stock ?? "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialImageUrl);
  const [fieldErrors, setFieldErrors] = useState({});

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
    if (Number.isNaN(price) || price <= 0) errors.price = "Enter a price greater than 0.";
    const stock = parseInt(form.stock, 10);
    if (Number.isNaN(stock) || stock < 0) errors.stock = "Enter a stock count of 0 or more.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      name: form.name.trim(),
      description: form.description.trim() || null,
      category: form.category.trim() || null,
      price: parseFloat(form.price),
      stock: parseInt(form.stock, 10),
      imageFile,
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-black/15 bg-[var(--color-paper)]">
          {imagePreview ? (
            <img src={imagePreview} alt="Product preview" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus className="h-6 w-6 text-[var(--color-muted)]" />
          )}
        </div>
        <label className="cursor-pointer text-sm font-medium text-[var(--color-storefront)] hover:underline">
          {imagePreview ? "Change photo" : "Add a photo"}
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="sr-only" />
        </label>
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
        <label htmlFor="description" className="text-sm font-medium text-[var(--color-ink)]">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Chilimansi flavor, 60g pack"
          value={form.description}
          onChange={handleChange}
          className="w-full rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-sm text-[var(--color-ink)] outline-none transition
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

      <div className="grid grid-cols-2 gap-4">
        <Input
          id="price"
          name="price"
          type="number"
          step="0.01"
          min="0"
          label="Price (₱)"
          placeholder="15.50"
          value={form.price}
          onChange={handleChange}
          error={fieldErrors.price}
        />
        <Input
          id="stock"
          name="stock"
          type="number"
          min="0"
          label="Stock"
          placeholder="40"
          value={form.stock}
          onChange={handleChange}
          error={fieldErrors.stock}
        />
      </div>

      {formError && (
        <p className="rounded-lg bg-[var(--color-crate)]/10 px-3 py-2 text-sm text-[var(--color-crate)]" role="alert">
          {formError}
        </p>
      )}

      <Button type="submit" loading={submitting} className="mt-1 w-full sm:w-auto">
        {submitLabel}
      </Button>
    </form>
  );
}
