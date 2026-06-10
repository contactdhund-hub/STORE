"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/actions/auth";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    const res = await registerUser(formData);

    if (res.error) {
      setError(res.error);
      setIsLoading(false);
    } else {
      // Auto login after signup
      const loginRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (loginRes?.error) {
         router.push("/login?registered=true");
      } else {
         router.push("/profile");
         router.refresh();
      }
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-60px)] items-center justify-center bg-[#f9fafb] px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-10 shadow-2xl rounded-2xl border border-gray-100">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold tracking-tight text-gray-900">
            Create an Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500">
            Join to track your orders and checkout faster
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="text-red-500 text-sm text-center font-medium bg-red-50 p-3 rounded-lg">{error}</div>}
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <input
                type="email"
                required
                className="relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-black focus:outline-none focus:ring-black sm:text-sm transition-colors"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                minLength={6}
                className="relative block w-full appearance-none rounded-none rounded-b-md border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-black focus:outline-none focus:ring-black sm:text-sm transition-colors"
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-black px-4 py-3 text-sm font-bold tracking-wide text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {isLoading ? "Creating account..." : "Sign up"}
            </button>
          </div>
          <div className="text-center text-sm">
            <span className="text-gray-500">Already have an account? </span>
            <Link href="/login" className="font-medium text-black hover:underline">
              Log in
            </Link>
          </div>

          <div className="mt-6 text-center">
            <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-black transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="m15 18-6-6 6-6"/></svg>
              Return to Store
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
