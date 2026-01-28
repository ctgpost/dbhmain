import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import type { Id } from "../../convex/_generated/dataModel";

export function EmployeeManagement() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Id<"employees"> | null>(null);
  const [filterBranch, setFilterBranch] = useState<Id<"branches"> | "all">("all");
  const [filterPosition, setFilterPosition] = useState<string>("all");

  const employees = useQuery(api.employees.list, {
    branchId: filterBranch !== "all" ? filterBranch : undefined,
    position: filterPosition !== "all" ? filterPosition : undefined,
  });
  const branches = useQuery(api.branches.list, {});

  const [formData, setFormData] = useState({
    employeeId: "",
    name: "",
    email: "",
    phone: "",
    position: "Cashier",
    branchId: "" as Id<"branches">,
    salary: 0,
    commissionRate: 0,
    permissions: [] as string[],
    address: "",
    emergencyContact: {
      name: "",
      phone: "",
      relation: "",
    },
  });

  const createEmployee = useMutation(api.employees.create);
  const updateEmployee = useMutation(api.employees.update);
  const removeEmployee = useMutation(api.employees.remove);

  const positions = ["Manager", "Cashier", "Sales Associate", "Stock Keeper"];
  const permissionsList = ["pos", "inventory", "reports", "customers", "settings"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (showEditModal && selectedEmployee) {
        const employee = employees?.find(e => e._id === selectedEmployee);
        await updateEmployee({
          id: selectedEmployee,
          ...formData,
          isActive: employee?.isActive ?? true,
        });
        toast.success("Employee updated successfully!");
      } else {
        await createEmployee(formData);
        toast.success("Employee added successfully!");
      }
      resetForm();
    } catch (error: any) {
      toast.error(error.message || "Failed to save employee");
    }
  };

  const handleEdit = (employeeId: Id<"employees">) => {
    const employee = employees?.find(e => e._id === employeeId);
    if (employee) {
      setFormData({
        employeeId: employee.employeeId,
        name: employee.name,
        email: employee.email || "",
        phone: employee.phone,
        position: employee.position,
        branchId: employee.branchId,
        salary: employee.salary || 0,
        commissionRate: employee.commissionRate || 0,
        permissions: employee.permissions,
        address: employee.address || "",
        emergencyContact: employee.emergencyContact || { name: "", phone: "", relation: "" },
      });
      setSelectedEmployee(employeeId);
      setShowEditModal(true);
    }
  };

  const handleDelete = async (employeeId: Id<"employees">) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      try {
        await removeEmployee({ id: employeeId });
        toast.success("Employee deleted successfully!");
      } catch (error: any) {
        toast.error(error.message || "Failed to delete employee");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: "",
      name: "",
      email: "",
      phone: "",
      position: "Cashier",
      branchId: "" as Id<"branches">,
      salary: 0,
      commissionRate: 0,
      permissions: [],
      address: "",
      emergencyContact: { name: "", phone: "", relation: "" },
    });
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedEmployee(null);
  };

  const togglePermission = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">👥 Employee Management</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
        >
          ➕ Add Employee
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Branch
            </label>
            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value as any)}
              className="input-field"
            >
              <option value="all">All Branches</option>
              {branches?.map((branch) => (
                <option key={branch._id} value={branch._id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Position
            </label>
            <select
              value={filterPosition}
              onChange={(e) => setFilterPosition(e.target.value)}
              className="input-field"
            >
              <option value="all">All Positions</option>
              {positions.map((position) => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Employees List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Employee ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Branch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees?.map((employee) => (
                <tr key={employee._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {employee.employeeId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                    <div className="text-sm text-gray-500">{employee.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.branchName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${employee.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {employee.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={() => handleEdit(employee._id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(employee._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">
                {showEditModal ? "Edit Employee" : "Add New Employee"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employee ID *
                    </label>
                    <input
                      type="text"
                      value={formData.employeeId}
                      onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Position *
                    </label>
                    <select
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="input-field"
                      required
                    >
                      {positions.map((position) => (
                        <option key={position} value={position}>
                          {position}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Branch *
                    </label>
                    <select
                      value={formData.branchId}
                      onChange={(e) => setFormData({ ...formData, branchId: e.target.value as Id<"branches"> })}
                      className="input-field"
                      required
                    >
                      <option value="">Select Branch</option>
                      {branches?.map((branch) => (
                        <option key={branch._id} value={branch._id}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Salary (BDT)
                    </label>
                    <input
                      type="number"
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) })}
                      className="input-field"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Commission Rate (%)
                    </label>
                    <input
                      type="number"
                      value={formData.commissionRate}
                      onChange={(e) => setFormData({ ...formData, commissionRate: parseFloat(e.target.value) })}
                      className="input-field"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="input-field"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permissions
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {permissionsList.map((permission) => (
                      <label key={permission} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(permission)}
                          onChange={() => togglePermission(permission)}
                          className="rounded"
                        />
                        <span className="text-sm capitalize">{permission}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Emergency Contact</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        value={formData.emergencyContact.name}
                        onChange={(e) => setFormData({
                          ...formData,
                          emergencyContact: { ...formData.emergencyContact, name: e.target.value }
                        })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.emergencyContact.phone}
                        onChange={(e) => setFormData({
                          ...formData,
                          emergencyContact: { ...formData.emergencyContact, phone: e.target.value }
                        })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Relation
                      </label>
                      <input
                        type="text"
                        value={formData.emergencyContact.relation}
                        onChange={(e) => setFormData({
                          ...formData,
                          emergencyContact: { ...formData.emergencyContact, relation: e.target.value }
                        })}
                        className="input-field"
                      />
                    </div>
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
                    {showEditModal ? "Update" : "Add"} Employee
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
