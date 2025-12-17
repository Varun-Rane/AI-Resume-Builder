import type { Route } from "./+types/home";
import Navbar from "../components/Navbar"
import { resumes } from "~/constants";
import ResumeCard from "~/components/ResumeCard";
import { useEffect } from "react";
import { usePuterStore } from "~/libs/puter";
import { useNavigate } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "AI-Resume Builder" },
    { name: "description", content: "Smart Resume for Your Dream job" },
  ];
}

export default function Home() {
const { auth } = usePuterStore();
  const navigate = useNavigate(); 

 useEffect ( () => {
    if(auth.isAuthenticated) navigate("/auth?next=/");
  }, [auth.isAuthenticated])

  return <main className = "bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />
      <section className="main-section">
        <div className="page-heading">
          <h1>Track Your Applications & Resume Ratings</h1>
          <h2>Review your Submissions and Check AI Powered Feedback</h2>
        </div>
      

      {resumes.length > 0 && (
        <div className="resume-section">
          {resumes.map((resume) => (
            <ResumeCard key={resume.id} resume={resume} />
          ))}
        </div>
      )}
      </section>
    </main>;
}
