import React from "react";
import { motion } from "framer-motion";
import AdminRoute from "@/components/AdminRoute";
import ReservationsManager from "@/components/marketplace/ReservationsManager";

export default function AdminReservations() {
  return (
    <AdminRoute>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6">
          <h1 className="text-2xl font-display font-bold text-foreground">Deal Reservations</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and review spot reservations from interested buyers</p>
        </div>
        <ReservationsManager />
      </motion.div>
    </AdminRoute>
  );
}