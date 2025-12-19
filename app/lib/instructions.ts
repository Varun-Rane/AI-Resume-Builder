export function prepareInstructions(
  jobTitle: string,
  jobDescription: string
) {
  return `
You are an ATS resume analyzer.

Job Title: ${jobTitle}

Job Description:
${jobDescription}

Analyze the resume and return JSON with:
- ATS score (0–100)
- strengths
- weaknesses
- improvement tips
`;
}
