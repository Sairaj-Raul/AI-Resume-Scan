// pages/Home.jsx
import { useState } from "react";
import UploadForm from "../components/UploadForm";
import ResultCard from "../components/ResultCard";

export default function Home() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">AI Resume Shortlisting Bot</h1>
      <UploadForm setResults={setResults} setLoading={setLoading} />
      {loading && <p className="mt-4 text-blue-600">Analyzing resumes...</p>}
      <div className="mt-6 space-y-4">
        {results.map((res, idx) => (
          <ResultCard key={idx} result={res} />
        ))}
      </div>
    </div>
  );
}
