import React, { type FormEvent, useState } from "react";
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import { convertPdfToImage } from "~/lib/pdf2image";
import { usePuterStore } from "~/lib/puter";
import { useNavigate } from "react-router";
import { generateUUID } from "~/lib/utils";
import { prepareInstructions } from "~/lib/instructions";

function Upload() {
  const { ai, fs, kv } = usePuterStore();
  const navigate = useNavigate();

  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = (file: File | null) => {
    setFile(file);
  };

  const handleAnalyse = async ({
    companyName,
    jobTitle,
    jobDescription,
    file,
  }: {
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    file: File;
  }) => {
    try {
      setIsProcessing(true);
      setStatusText("Uploading your file...");

      const uploadFile = await fs.upload([file]);
      if (!uploadFile) return setStatusText("Error: Failed to upload file");

      setStatusText("Converting PDF to image...");
      const imageFile = await convertPdfToImage(file);
      if (!imageFile?.file)
        return setStatusText("Error: PDF conversion failed");

      const uploadImage = await fs.upload([imageFile.file]);
      if (!uploadImage) return setStatusText("Error: Failed to upload image");

      setStatusText("Processing resume...");

      const uuid = generateUUID();
      const data = {
        id: uuid,
        resumePath: uploadFile.path,
        imagePath: uploadImage.path,
        companyName,
        jobTitle,
        jobDescription,
        feedback: "",
      };

      await kv.set(`resume:${uuid}`, JSON.stringify(data));

      setStatusText("Analyzing resume...");

      const feedback = await ai.feedback(
        uploadFile.path,
        prepareInstructions(jobTitle, jobDescription)
      );

      if (!feedback) {
        setStatusText("Error: AI analysis failed");
        return;
      }

      if (!feedback) return setStatusText("Error: AI analysis failed");

      const feedbackText =
        typeof feedback.message.content === "string"
          ? feedback.message.content
          : feedback.message.content[0].text;

      data.feedback = JSON.parse(feedbackText);
      await kv.set(`resume:${uuid}`, JSON.stringify(data));

      setStatusText("Analysis complete. Redirecting...");
      navigate(`/resume/${uuid}`);
    } catch (err) {
      console.error(err);
      setStatusText("Something went wrong");
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) return;

    const formData = new FormData(e.currentTarget);

    const companyName = formData.get("company-name") as string;
    const jobTitle = formData.get("job-title") as string;
    const jobDescription = formData.get("job-description") as string;

    handleAnalyse({ companyName, jobTitle, jobDescription, file });
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
                <label>Company Name</label>
                <input name="company-name" placeholder="Company Name" />
              </div>

              <div className="form-div">
                <label>Job Title</label>
                <input name="job-title" placeholder="Job Title" />
              </div>

              <div className="form-div">
                <label>Job Description</label>
                <textarea
                  name="job-description"
                  rows={5}
                  placeholder="Job Description"
                />
              </div>

              <div className="form-div">
                <label>Upload Resume</label>
                <FileUploader onFileSelect={handleFileSelect} />
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
