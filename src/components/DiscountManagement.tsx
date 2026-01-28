import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import type { Id } from "../../convex/_generated/dataModel";

export function DiscountManagement() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<Id<"discounts"> | null>(null);

  const discounts = useQuery(api.discounts.list, {});
  const categories = useQuery(api.categories.list);
  const products = useQuery(api.products.list, {});
  const branches = useQuery(api.branches.list, {});

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "percentage" as "percentage" | "fixed_amount",
    value: 0,
    scope: "all_products" as "all_products" | "category" | "specific_products",
    categoryIds: [] as Id<"categories">[],
    productIds: [] as Id<"products">[],
    branchIds: [] as Id<"branches">[],
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    usageLimit: undefined as number | undefined,
    minPurchaseAmount: undefined as number | undefined,
    maxDiscountAmount: undefined as number | undefined,
  });

  const createDiscount = useMutation(api.discounts.create);
  const updateDiscount = useMutation(api.discounts.update);
  const removeDiscount = useMutation(api.discounts.remove);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        startDate: new Date(formData.startDate).getTime(),
        endDate: new Date(formData.endDate).getTime(),
      };

      if (showEditModal && selectedDiscount) {
        const discount = discounts?.find(d => d._id === selectedDiscount);
        await updateDiscount({
          id: selectedDiscount,
          ...data,
          isActive: discount?.isActive ?? true,
        });
        toast.success("Discount updated successfully!");
      } else {
        await createDiscount(data);
        toast.success("Discount created successfully!");
      }
      resetForm();
    } catch (error: any) {
      toast.error(error.message || "Failed to save discount");
    }
  };

  const handleEdit = (discountId: Id<"discounts">) => {
    const discount = discounts?.find(d => d._id === discountId);
    if (discount) {
      setFormData({
        name: discount.name,
        description: discount.description || "",
        type: discount.type as any,
        value: discount.value,
        scope: discount.scope as any,
        categoryIds: discount.categoryIds || [],
        productIds: discount.productIds || [],
        branchIds: discount.branchIds || [],
        startDate: new Date(discount.startDate).toISOString().split('T')[0],
        endDate: new Date(discount.endDate).toISOString().split('T')[0],
        usageLimit: discount.usageLimit,
        minPurchaseAmount: discount.minPurchaseAmount,
        maxDiscountAmount: discount.maxDiscountAmount,
      });
      setSelectedDiscount(discountId);
      setShowEditModal(true);
    }
  };

  const handleDelete = async (discountId: Id<"discounts">) => {
    if (confirm("Are you sure you want to delete this discount?")) {
      try {
        await removeDiscount({ id: discountId });
        toast.success("Discount deleted successfully!");
      } catch (error: any) {
        toast.error(error.message || "Failed to delete discount");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      type: "percentage",
      value: 0,
      scope: "all_products",
      categoryIds: [],
      productIds: [],
      branchIds: [],
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      usageLimit: undefined,
      minPurchaseAmount: undefined,
      maxDiscountAmount: undefined,
    });
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedDiscount(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">🎁 Discount Management</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
        >
          ➕ Create Discount
        </button>
      </div>

      {/* Discounts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {discounts?.map((discount) => {
          const isActive = discount.isActive && 
            discount.startDate <= Date.now() && 
            discount.endDate >= Date.now();
          const isExpired = discount.endDate < Date.now();
          
          return (
            <div key={discount._id} className="bg-white rounded-lg shadow p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{discount.name}</h3>
                  <p className="text-sm text-gray-600">{discount.description}</p>
                </div>
                <span className={`badge ${isActive ? 'badge-success' : isExpired ? 'badge-danger' : 'badge-warning'}`}>
                  {isActive ? 'Active' : isExpired ? 'Expired' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">
                    {discount.type === "percentage" ? `${discount.value}%` : `৳${discount.value}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Scope:</span>
                  <span className="font-medium capitalize">{discount.scope.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Usage:</span>
                  <span className="font-medium">
                    {discount.usageCount} {discount.usageLimit ? `/ ${discount.usageLimit}` : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Valid Until:</span>
                  <span className="font-medium">
                    {new Date(discount.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex space-x-2 pt-2 border-t">
                <button
                  onClick={() => handleEdit(discount._id)}
                  className="flex-1 text-sm text-blue-600 hover:text-blue-900"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(discount._id)}
                  className="flex-1 text-sm text-red-600 hover:text-red-900"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">
                {showEditModal ? "Edit Discount" : "Create New Discount"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="input-field"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="input-field"
                      required
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed_amount">Fixed Amount (৳)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Value *
                    </label>
                    <input
                      type="number"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                      className="input-field"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apply To *
                    </label>
                    <select
                      value={formData.scope}
                      onChange={(e) => setFormData({ ...formData, scope: e.target.value as any })}
                      className="input-field"
                      required
                    >
                      <option value="all_products">All Products</option>
                      <option value="category">Specific Categories</option>
                      <option value="specific_products">Specific Products</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Usage Limit
                    </label>
                    <input
                      type="number"
                      value={formData.usageLimit || ""}
                      onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="input-field"
                      min="0"
                      placeholder="Unlimited"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min Purchase Amount (৳)
                    </label>
                    <input
                      type="number"
                      value={formData.minPurchaseAmount || ""}
                      onChange={(e) => setFormData({ ...formData, minPurchaseAmount: e.target.value ? parseFloat(e.target.value) : undefined })}
                      className="input-field"
                      min="0"
                      step="0.01"
                      placeholder="No minimum"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Discount Amount (৳)
                    </label>
                    <input
                      type="number"
                      value={formData.maxDiscountAmount || ""}
                      onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value ? parseFloat(e.target.value) : undefined })}
                      className="input-field"
                      min="0"
                      step="0.01"
                      placeholder="No maximum"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {showEditModal ? "Update" : "Create"} Discount
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
