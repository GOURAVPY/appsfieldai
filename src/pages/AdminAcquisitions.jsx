import React from "react";
import AdminRoute from "@/components/AdminRoute";
import AcquisitionRequestsManager from "@/components/marketplace/AcquisitionRequestsManager";

export default function AdminAcquisitions() {
  return (
    <AdminRoute>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Acquisition Requests</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and review acquisition requests from users</p>
        </div>
        <AcquisitionRequestsManager />
      </div>
    </AdminRoute>
  );
}