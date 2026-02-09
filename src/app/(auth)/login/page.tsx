"use client";

import { useState } from "react";
import { loginService } from "../../../services/auth/LoginServices";

type LoginFormState = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export default function LoginPage() {
  const [form, setForm] = useState<LoginFormState>({
    id: "",
    name: "",
    created_at: "",
    updated_at: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const now = new Date().toISOString();
      await loginService({
        id: Number(form.id),
        name: form.name.trim(),
        created_at: form.created_at || now,
        updated_at: form.updated_at || now,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main style={{ padding: "24px", maxWidth: "420px" }}>
      <h2>Login</h2>
      <p>Sign in to continue.</p>
      <form onSubmit={handleSubmit} style={{ marginTop: "16px" }}>
        <label style={{ display: "block", marginBottom: "12px" }}>
          ID
          <input
            type="number"
            name="id"
            value={form.id}
            onChange={handleChange}
            required
            style={{ display: "block", width: "100%", marginTop: "4px" }}
          />
        </label>
        <label style={{ display: "block", marginBottom: "12px" }}>
          Name
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            style={{ display: "block", width: "100%", marginTop: "4px" }}
          />
        </label>
     
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>
    </main>
  );
}
