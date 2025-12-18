import React, { type FormEvent, useState } from "react";
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import {convertPdfToImage} from "../lib/pdf2image"
import { usePuterStore } from "~/lib/puter";
import { useNavigate } from "react-router";
import { generateUUID } from "~/lib/utils";

function Upload() {
    const {auth, ai, isLoading, fs, kv} = usePuterStore();
    const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = (file : File | null) => {
    setFile(file);
  }

   const handleAnalyse = async ({companyName , jobTitle, jobDescription, file} : {companyName : string , jobTitle : string , jobDescription : string , file : File}) => {
        setIsProcessing(true);
        setStatusText("Uploading your file...");
        const uploadFile = await fs.upload([file]);
        if(!uploadFile) return setStatusText('Error : Failed to Upload File');
        setStatusText('Converting PDF file to Image...');
        const imageFile = await convertPdfToImage(file);
        if(!imageFile.file) return setStatusText('Error : Failed to Convert to Image');

        const uploadImage = await fs.upload([imageFile.file]);
        if(!uploadFile) return setStatusText('Error : Failed to Upload Image');

        setStatusText('Processing...');
        const uuid = generateUUID();
        const data = {
            id : uuid,
            resumePath : uploadFile.path,
            imagePath : uploadImage.path,
            companyName, jobTitle, jobDescription,
            feedback : '',
        }
        await kv.set(`resume : ${uuid}`, JSON.stringify(data));
        setStatusText('Analysing...');
        const feedback = await ai.feedback(
            path : uploadFile.path,
            message : prepareInstructions(jobTitle, jobDescription),
        );
        if(!feedback) return setStatusText('Error : Failed to Analyse Resume');

        const feedbackText = typeof feedback.message.content ===  'string' 
            ? feedback.message.content
            : feedback.message.content[0].text;

        data.feedback = JSON.parse(feedbackText);
        await kv.set(`resume : ${uuid}`, JSON.stringify(data));
        setStatusText('Analysis Complete, Redirecting...');
    }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

   
    const form = e.currentTarget.closest('from');
    if(!form) return;
    const formData = new FormData(form);

    const companyName = formData.get('company-name') as string;
    const jobTitle = formData.get('job-title') as string;
    const  jobDescription = formData.get('job-description') as string;

    if(!file) return;
    handleAnalyse({companyName, jobTitle, jobDescription, file});
    setIsProcessing(true);
    setStatusText("Analyzing your resume...");
  };

  return (
    <main className="relative min-h-screen bg-gradient overflow-hidden">
      <Navbar />

      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Smart Feedback for your Dream Job</h1>

          {isProcessing ? (
            <>
              <h2>{statusText}</h2>
              <img
                src="/images/resume-scan.gif"
                className="w-full"
                alt="Scanning resume"
              />
            </>
          ) : (
            <h2>Drop your Resume for an ATS Score and Improvement Tips</h2>
          )}

          {!isProcessing && (
            <form
              onSubmit={handleSubmit}
              className="upload-form flex flex-col gap-4 mt-4"
            >
              <div className="form-div">
                <label htmlFor="company-name">Company Name</label>
                <input
                  type="text"
                  id="company-name"
                  placeholder="Company Name"
                />
              </div>

              <div className="form-div">
                <label htmlFor="job-title">Job Title</label>
                <input
                  type="text"
                  id="job-title"
                  placeholder="Job Title"
                />
              </div>

              <div className="form-div">
                <label htmlFor="job-description">Job Description</label>
                <textarea
                  id="job-description"
                  rows={5}
                  placeholder="Job Description"
                />
              </div>

              <div className="form-div">
                <label>Upload Resume</label>
                <FileUploader onFileSelect={handleFileSelect}/>
              </div>

              <button className="primary-button" type="submit">
                Analyze Resume
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

export default Upload;
