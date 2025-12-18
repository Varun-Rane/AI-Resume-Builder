import type { Route } from "./+types/home";
import Navbar from "../components/Navbar"
import { resumes } from "~/constants";
import ResumeCard from "~/components/ResumeCard";
import { useEffect } from "react";
import { usePuterStore } from "~/lib/puter";
import { useNavigate } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "AI-Resume Builder" },
    { name: "description", content: "Smart Resume for Your Dream job" },
  ];
}

export default function Home() {
const { auth,isLoading } = usePuterStore();
  const navigate = useNavigate(); 
useEffect(() => {
  if (!auth.isAuthenticated && !isLoading) {
    navigate("/auth?next=/");
  }
}, [auth.isAuthenticated, isLoading]);


  return <main className = "relative min-h-screen bg-gradient overflow-hidden">
      <Navbar />
      <section className="main-section">
        <div className="page-heading">
          <h1>Track Your Applications & Resume Ratings</h1>
          <h2>Review your Submissions and Check AI Powered Feedback</h2>
        </div>
      

      {resumes.length > 0 && (
        <div className="resumes-section">
          {resumes.map((resume) => (
            <ResumeCard key={resume.id} resume={resume} />
          ))}
        </div>
      )}
      </section>
    </main>;
}
