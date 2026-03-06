"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ErrorAlert } from "@/components/ui";
import { UserRole } from "@/types";

interface FormValues {
  name: string;
  email: string;
  password: string;
  role: UserRole | "";
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
}

/* ✅ Employee removed */
const ROLES: { value: UserRole; label: string; description: string }[] = [
  { value: "HR", label: "HR", description: "Manage employees & analytics" },
  { value: "Manager", label: "Manager", description: "Review & appraise team" },
];

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.name.trim()) {
    errors.name = "Full name is required";
  }

  if (!values.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Invalid email";
  }

  if (!values.password) {
    errors.password = "Password is required";
  } else if (values.password.length < 6) {
    errors.password = "Minimum 6 characters";
  }

  if (!values.role) {
    errors.role = "Please select a role";
  }

  return errors;
}

export default function RegisterPage() {
  const { register, error, clearError } = useAuth();

  const [values, setValues] = useState<FormValues>({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    setValues((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    if (error) {
      clearError();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationErrors = validate(values);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role as UserRole,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gray-50">
      <div className="w-full max-w-md border  rounded-xl p-4 shadow-lg">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
              PA
            </div>
            <span className="font-semibold text-gray-800">
              Appraisal System
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create account
          </h1>
          <p className="text-gray-500">Register as HR or Manager</p>
        </div>

        {error && (
          <ErrorAlert message={error} onDismiss={clearError} className="mb-6" />
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <Input
            label="Full name"
            type="text"
            name="name"
            autoComplete="name"
            placeholder="John Doe"
            value={values.name}
            onChange={handleChange}
            error={errors.name}
          />

          <Input
            label="Email address"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={values.email}
            onChange={handleChange}
            error={errors.email}
          />

          <Input
            label="Password"
            type="password"
            name="password"
            autoComplete="new-password"
            placeholder="At least 6 characters"
            value={values.password}
            onChange={handleChange}
            error={errors.password}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Select your role
            </label>

            <div className="grid grid-cols-2 gap-2">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => {
                    setValues((prev) => ({ ...prev, role: r.value }));
                    setErrors((prev) => ({ ...prev, role: undefined }));
                  }}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 text-center transition-all duration-150 ${
                    values.role === r.value
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <span className="font-semibold text-sm">{r.label}</span>
                  <span className="text-xs leading-tight opacity-70">
                    {r.description}
                  </span>
                </button>
              ))}
            </div>

            {errors.role && (
              <p className="text-xs text-red-500">{errors.role}</p>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            isLoading={isSubmitting}
            className="w-full"
          >
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-indigo-600 hover:text-indigo-700"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
