import React, { useState, useEffect } from "react";
import { Check, X, Trash2, Loader2 } from "lucide-react";
import api from "../api/axios";

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/doctors");
      setDoctors(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch doctors", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, isApproved) => {
    setActionLoading(id);
    try {
      await api.patch(`/admin/doctors/${id}/approve`, { isApproved });
      setDoctors(doctors.map(doc => doc._id === id ? { ...doc, isApprovedByAdmin: isApproved } : doc));
    } catch (error) {
      alert("Failed to update doctor status.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this doctor's account?")) return;
    setActionLoading(id);
    try {
      await api.delete(`/admin/delete-account/${id}`, { data: { role: "doctor" } });
      setDoctors(doctors.filter(doc => doc._id !== id));
    } catch (error) {
      alert("Failed to delete account.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-red-600" /></div>;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden animate-fade-in-up">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 text-sm uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Doctor Name</th>
              <th className="px-6 py-4">Specialty</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {doctors.map((doc) => (
              <tr key={doc._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">Dr. {doc.fullName}</td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{doc.speciality || "N/A"}</td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{doc.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${doc.isApprovedByAdmin ? "bg-green-100 text-green-700 dark:bg-green-500/10" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10"}`}>
                    {doc.isApprovedByAdmin ? "Approved" : "Pending"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {!doc.isApprovedByAdmin && (
                      <button onClick={() => handleApprove(doc._id, true)} disabled={actionLoading === doc._id} className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50" title="Approve">
                        {actionLoading === doc._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      </button>
                    )}
                    <button onClick={() => handleDelete(doc._id)} disabled={actionLoading === doc._id} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50" title="Delete Account">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDoctors;