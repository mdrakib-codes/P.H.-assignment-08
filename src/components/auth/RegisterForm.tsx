"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/Spinner";
import { authClient } from "@/lib/auth-client";

interface RegisterFormProps {
  googleEnabled: boolean;
}

const PASSWORD_RULES = [
  { label: "At least one uppercase letter", pattern: /[A-Z]/ },
  { label: "At least one lowercase letter", pattern: /[a-z]/ },
  { label: "Minimum 8 characters", pattern: /.{8,}/ },
] as const;

export function RegisterForm({ googleEnabled }: RegisterFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordChecks = PASSWORD_RULES.map((rule) => ({
    label: rule.label,
    valid: rule.pattern.test(password),
  }));
  const isPasswordValid = passwordChecks.every((rule) => rule.valid);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting || !isPasswordValid) {
      return;
    }

    if (!name.trim() || !email.trim()) {
      const message = "Enter your name and email address.";
      setError(message);
      toast.error(message);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (result.error) {
        const message = result.error.message || "We could not create your account.";
        setError(message);
        toast.error(message);
        return;
      }

      toast.success("Account created. Sign in to get started.");
      router.push("/login");
      router.refresh();
    } catch {
      const message = "We could not create your account. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogle() {
    if (!googleEnabled) {
      toast.info(
        "Google sign-in isn't configured yet. Add Google credentials to enable it.",
      );
      return;
    }

    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });

      if (result.error) {
        const message = result.error.message || "Google sign-in failed.";
        setError(message);
        toast.error(message);
      }
    } catch {
      const message = "Google sign-in failed. Please try again.";
      setError(message);
      toast.error(message);
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-base-300 bg-base-200 p-6 shadow-xl sm:p-8">
      <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-primary">
        Join StudioSpace
      </p>
      <h1 className="mt-3 font-heading text-3xl font-semibold leading-[1.15]">
        Create your account.
      </h1>
      <p className="mt-3 leading-7 text-muted">
        Book creative studios, host your own space and keep every production in
        one place.
      </p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
        <label className="form-control block">
          <span className="label-text mb-2 font-medium">Name</span>
          <input
            type="text"
            value={name}
            autoComplete="name"
            placeholder="Your full name"
            className="input input-bordered w-full bg-base-100"
            onChange={(event) => {
              setName(event.target.value);
              setError(null);
            }}
          />
        </label>

        <label className="form-control block">
          <span className="label-text mb-2 font-medium">Email</span>
          <input
            type="email"
            value={email}
            autoComplete="email"
            placeholder="you@example.com"
            className="input input-bordered w-full bg-base-100"
            onChange={(event) => {
              setEmail(event.target.value);
              setError(null);
            }}
          />
        </label>

        <div>
          <label
            htmlFor="register-password"
            className="font-medium leading-6 whitespace-nowrap"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              value={password}
              autoComplete="new-password"
              className="input input-bordered mt-2 w-full bg-base-100"
              aria-invalid={password.length > 0 && !isPasswordValid}
              onChange={(event) => {
                setPassword(event.target.value);
                setError(null);
              }}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((visible) => !visible)}
            >
              {showPassword ? (
                <FiEyeOff aria-hidden="true" className="size-5" />
              ) : (
                <FiEye aria-hidden="true" className="size-5" />
              )}
            </button>
          </div>
          <ul className="mt-3 space-y-1.5" aria-label="Password requirements">
            {passwordChecks.map((rule) => (
              <li
                key={rule.label}
                className={`flex items-center gap-2 text-sm ${
                  rule.valid ? "text-success" : "text-muted"
                }`}
              >
                <span aria-hidden="true">{rule.valid ? "✓" : "○"}</span>
                <span>{rule.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-error/40 bg-error/10 px-3 py-2 text-sm text-error"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={isSubmitting || !isPasswordValid}
        >
          {isSubmitting ? (
            <>
              <Spinner size={18} label="Creating account" />
              Creating account...
            </>
          ) : (
            "Register"
          )}
        </button>
      </form>

      <div className="divider my-5 text-xs uppercase tracking-[0.12em] text-muted">
        or
      </div>

      <button
        type="button"
        className="btn btn-outline w-full"
        onClick={handleGoogle}
      >
        <FcGoogle aria-hidden="true" className="size-5" />
        Continue with Google
      </button>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="link link-primary font-medium">
          Login
        </Link>
      </p>
    </div>
  );
}
