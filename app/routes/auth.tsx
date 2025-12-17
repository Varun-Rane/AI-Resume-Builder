import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { usePuterStore } from "~/libs/puter";

export const meta = () => {
  return [
    { title: "Resumind | Auth" },
    { name: "description", content: "Log in Your Account" },
  ];
};

function Auth() {
  const { isLoading, auth } = usePuterStore();
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const next = params.get("next") || "/";

  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate(next, { replace: true });
    }
  }, [auth.isAuthenticated, next, navigate]);

  return (
    <main className="bg-[url('/images/bg-auth.svg')] bg-cover min-h-screen flex items-center justify-center">
      <div className="gradient-border shadow-lg">
        <section className="flex flex-col gap-8 bg-white rounded-2xl p-10">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1>Welcome</h1>
            <h2>Log In to Continue Your Job Journey</h2>
          </div>

          {isLoading ? (
            <button className="auth-button animate-pulse">
              Signing you in...
            </button>
          ) : auth.isAuthenticated ? (
            <button className="auth-button" onClick={auth.signOut}>
              Sign Out
            </button>
          ) : (
            <button className="auth-button" onClick={auth.signIn}>
              Login
            </button>
          )}
        </section>
      </div>
    </main>
  );
}

export default Auth;
