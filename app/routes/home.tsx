import type { Route } from "./+types/home";
import Navbar from "../components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import { Link, useNavigate } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "AI-Resume Builder" },
    { name: "description", content: "Smart Resume for Your Dream job" },
  ];
}

export default function Home() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const { auth, isLoading, fs, kv } = usePuterStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.isAuthenticated && !isLoading) {
      navigate("/auth?next=/");
    }
  }, [auth.isAuthenticated, isLoading]);

  useEffect(() => {
    const loadResumes = async () => {
      setLoadingResumes(true);
      const resumes = (await kv.list('resume:*' , true)) as KVItem[];
      const parsedResumes =resumes ?.map((resume) => (
        JSON.parse(resume.value) as Resume
      ))
      setResumes(parsedResumes || []);
      setLoadingResumes(false);
    }
    loadResumes();
  })

  return (
    <main className="relative min-h-screen bg-gradient overflow-hidden">
      <Navbar />
      <section className="main-section">
        <div className="page-heading">
          <h1>Track Your Applications & Resume Ratings</h1>
          {!loadingResumes && resumes?.length === 0 ? (
            <h2>No Resumes Found. Upload Your Resume to get Feedback</h2>
          ) : (
            <h2>Review your Submissions and Check AI Powered Feedback</h2>
          )}
        </div>
        {loadingResumes && (
          <div className="flex flex-col items-center justify-center">
            <img src='/images/resume-scan-2.gif' alt="scanning resume" className="w-[200px]" />
          </div>
        )}

        {!loadingResumes && resumes.length > 0 && (
          <div className="resumes-section">
            {resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} />
            ))}
          </div>
        )}

      {!loadingResumes && resumes.length === 0 && (
        <div className="flex flex-col items-center justify-center mt-10 gap-4">
          <Link to='/upload' className='primary-button w-fit text-xl font-semibold'>Upload Resume</Link>
        </div>
      )}        

      </section>
    </main>
  );
}
