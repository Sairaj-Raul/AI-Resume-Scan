import { useState } from "react";
import axios from "axios";

export default function UploadForm() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [jobDescription, setJobDescription] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const filesArray = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...filesArray]);
  };

  const handleRemoveFile = (indexToRemove) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this resume?"
    );
    if (!confirmDelete) return;
    const updatedFiles = selectedFiles.filter((_, i) => i !== indexToRemove);
    setSelectedFiles(updatedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!jobDescription || selectedFiles.length === 0) {
      alert("Please enter a job description and upload at least one resume.");
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("resumes", file));
    formData.append("jobDescription", jobDescription);

    try {
      setLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/resume/analyze`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setResults(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to analyze resumes. Check backend and CORS settings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 mt-8 bg-white rounded-2xl shadow-md border border-gray-200">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        AI Resume Analyzer
      </h1>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="jobDescription"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Job Description
          </label>
          <textarea
            id="jobDescription"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={6}
            placeholder="Paste the job description here..."
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload Resumes (PDF/DOCX)
          </label>
          <input
            type="file"
            multiple
            accept=".pdf,.docx"
            onChange={handleFileChange}
            className="w-full file:px-4 file:py-2 file:border-0 file:rounded file:bg-blue-600 file:text-white file:cursor-pointer text-sm text-gray-500"
          />
        </div>

        {selectedFiles.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">
              Uploaded Files:
            </h3>
            <ul className="space-y-2">
              {selectedFiles.map((file, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-lg text-sm"
                >
                  <span>{file.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Analyze Resumes"}
        </button>
      </form>

      {results.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Analysis Results
          </h2>
          <div className="space-y-6">
            {results.map((res, idx) => (
              <div
                key={idx}
                className="p-4 border border-gray-300 rounded-lg bg-gray-50"
              >
                <h3 className="font-bold text-blue-600">{res.candidateName}</h3>
                <p className="mt-1 text-sm">
                  Score: <strong>{res.score}</strong>/100
                </p>
                <div className="mt-2">
                  <p className="font-semibold text-green-600">Good Points:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700">
                    {res.goodPoints.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-2">
                  <p className="font-semibold text-red-600">Bad Points:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700">
                    {res.badPoints.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
