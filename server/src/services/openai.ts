import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface AnalysisResult {
  overallScore: number;
  matchScore: number;
  skills: {
    matched: string[];
    missing: string[];
    extra: string[];
  };
  sections: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
  atsCompatibility: {
    score: number;
    issues: string[];
  };
  keywordDensity: { keyword: string; count: number }[];
  summary: string;
}

export const analyzeResume = async (
  resumeText: string,
  jobDescription: string,
  jobTitle: string
): Promise<AnalysisResult> => {
  const prompt = `You are an expert recruiter and ATS (Applicant Tracking System) analyst with 15+ years of experience.

Your job is to CAREFULLY read the full resume text and accurately identify every skill, technology, tool, and experience mentioned — including abbreviations, alternate names, and implied skills.

CRITICAL MATCHING RULES (follow these strictly):
1. Read the ENTIRE resume text word by word before classifying any skill
2. Treat these as equivalent: "Python" = "python" = "Python3" = "Python 3" = "py"
3. Treat these as equivalent: "JS" = "JavaScript", "TS" = "TypeScript", "Node" = "Node.js", "React.js" = "ReactJS" = "React", "Postgres" = "PostgreSQL", "ML" = "Machine Learning", "AI" = "Artificial Intelligence"
4. If a skill appears ANYWHERE in the resume (projects, experience, education, certifications, skills section) — it counts as PRESENT
5. Only mark a skill as "missing" if after reading the full resume you are 100% certain it is nowhere in the resume
6. Do NOT mark a skill as missing if you are unsure — mark it as matched instead
7. Consider related/parent skills: if resume has "Django" → Python is implied and matched; if resume has "React" → JavaScript is implied

RESUME (read every word carefully):
---
${resumeText.substring(0, 4500)}
---

JOB TITLE: ${jobTitle}

JOB DESCRIPTION:
---
${jobDescription.substring(0, 2500)}
---

After carefully reading both, return ONLY a valid JSON object:
{
  "overallScore": <number 0-100, honest assessment>,
  "matchScore": <number 0-100, how well resume matches this specific job>,
  "skills": {
    "matched": [<every skill/tech found in BOTH resume and job description — be thorough>],
    "missing": [<ONLY skills clearly required in job but truly absent from resume after careful reading>],
    "extra": [<valuable skills in resume not mentioned in job description — good bonus points>]
  },
  "sections": {
    "strengths": [<4-5 specific, evidence-based strong points from THIS resume>],
    "weaknesses": [<3-4 genuine gaps or areas to improve — be honest but fair>],
    "suggestions": [<5-7 concrete, actionable suggestions to improve this resume for this specific job>]
  },
  "atsCompatibility": {
    "score": <number 0-100>,
    "issues": [<specific ATS formatting or keyword density issues found>]
  },
  "keywordDensity": [
    { "keyword": "<important keyword from job description>", "count": <times it appears in resume> }
  ],
  "summary": "<2-3 sentence honest executive summary of this candidate's fit for this specific role>"
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 2000,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('No response from OpenAI');

  return JSON.parse(content) as AnalysisResult;
};