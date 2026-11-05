import { useEffect, useState } from "react";
import { api } from "./api/client";

export default function App() {
  const [status, setStatus] = useState("checking...");

  useEffect(() => {
    api
      .get("/health")
      .then((res) => setStatus(res.data.status))
      .catch(() => setStatus("backend unreachable"));
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-red-100">
      <p className="text-xl font-semibold text-gray-800">
        Backend status: {status}
      </p>
    </div>
  );
}
