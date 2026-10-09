"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

type Health = {
  status: string;
  database: string;
};

export default function Home() {
  const [health, setHealth] = useState<Health | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<Health>("/api/health")
      .then(setHealth)
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="rounded-xl border p-8 text-center shadow-sm">
        <h1 className="mb-4 text-2xl font-semibold">Airbnb Clone — Phase 0</h1>

        {error && <p className="text-red-600">Backend error: {error}</p>}
        {!error && !health && <p className="text-gray-500">Checking backend…</p>}
        {health && (
          <p className="text-green-600">
            API: {health.status} · Database: {health.database}
          </p>
        )}
      </div>
    </main>
  );
}