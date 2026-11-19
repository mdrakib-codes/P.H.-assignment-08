"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/Spinner";
import { authClient } from "@/lib/auth-client";

interface LoginFormProps {
  googleEnabled: boolean;
}

function getSafeRedirect(value: string | null): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return "/";
  }

  return value;
}

function getRedirectTarget(): string {
  if (typeof window === "undefined") {
    return "/";
  }

  return getSafeRedirect(
    new URLSearchParams(window.location.search).get("redirect"),
  );
}

export function LoginForm({ googleEnabled }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!email.trim() || !password) {
      const message = "Enter your email and password.";
      setError(message);
      toast.error(message);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await authClient.signIn.email({
        email: email.trim(),
        password,
      });

      if (result.error) {
        const message = result.error.message || "We could not sign you in.";
        setError(message);
        toast.error(message);
        return;
      }

      toast.success("Welcome back to StudioSpace.");
      router.push(getRedirectTarget());
      router.refresh();
    } catch {
      const message = "We could not sign you in. Please try again.";
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
        callbackURL: getRedirectTarget(),
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
        StudioSpace account
      </p>
      <h1 className="mt-3 font-heading text-3xl font-semibold leading-[1.15]">
        Welcome back.
      </h1>
      <p className="mt-3 leading-7 text-muted">
        Sign in to manage your bookings, listings and creative space.
      </p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
        <label className="form-control block">
          <span className="label-text mb-2 font-medium">Email</span>
          <input
            type="email"
            value={email}
            autoComplete="email"
            placeholder="you@example.com"
            className="input input-bordered w-full bg-base-100"
            aria-invalid={Boolean(error)}
            onChange={(event) => {
              setEmail(event.target.value);
              setError(null);
            }}
          />
        </label>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label
              htmlFor="login-password"
              className="font-medium leading-6 whitespace-nowrap"
            >
              Password
            </label>
            <button
              type="button"
              className="link link-primary shrink-0 whitespace-nowrap leading-6 font-normal underline-offset-2 transition-colors duration-150"
              onClick={() =>
                toast.info(
                  "Password reset isn't available yet. Contact support for help.",
                )
              }
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              value={password}
              autoComplete="current-password"
              className="input input-bordered w-full bg-base-100"
              aria-invalid={Boolean(error)}
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
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Spinner size={18} label="Signing in" />
              Signing in...
            </>
          ) : (
            "Login"
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
        New to StudioSpace?{" "}
        <Link href="/register" className="link link-primary font-medium">
          Create an account
        </Link>
      </p>
    </div>
  );
}
