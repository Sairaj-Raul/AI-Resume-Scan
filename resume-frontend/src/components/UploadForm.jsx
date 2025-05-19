import React, { useState } from "react";
import axios from "axios";

const UploadForm = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [jobDescription, setJobDescription] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  // const handleFileChange = (e) => {
  //   setSelectedFiles([...e.target.files]);
  // };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    const existingNames = new Set(selectedFiles.map((f) => f.name));
    const mergedFiles = [...selectedFiles];

    newFiles.forEach((file) => {
      if (!existingNames.has(file.name)) {
        mergedFiles.push(file);
      }
    });

    setSelectedFiles(mergedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFiles.length || !jobDescription) return;

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("resumes", file));
    formData.append("jobDescription", jobDescription);

    try {
      setLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/resume/analyze`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setResponse(res.data);
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          AI Resume Analyzer
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Input */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Upload Resumes
            </label>
            <input
              type="file"
              multiple
              accept=".pdf,.docx"
              onChange={handleFileChange}
              className="w-full border border-gray-300 rounded-lg p-2 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition"
            />
            {selectedFiles.length > 0 && (
              <ul className="mt-2 list-disc list-inside text-sm text-gray-600">
                {selectedFiles.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Job Description
            </label>
            <textarea
              rows="5"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm"
              placeholder="Paste your job description here..."
              required
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Analyze Resumes"}
          </button>
        </form>

        {/* Response Display */}
        {response && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Analysis Results:
            </h3>
            <div className="space-y-4">
              {response.map((res, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-xl border">
                  <h4 className="font-semibold text-blue-700">
                    {res.candidateName}
                  </h4>
                  <p className="text-sm mt-1 mb-2">
                    Score: <span className="font-bold">{res.score}</span>/100
                  </p>
                  <div>
                    <p className="font-medium text-green-700">
                      ✅ Good Points:
                    </p>
                    <ul className="list-disc ml-6 text-sm text-green-800">
                      {res.goodPoints.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-2">
                    <p className="font-medium text-red-700">⚠️ Bad Points:</p>
                    <ul className="list-disc ml-6 text-sm text-red-800">
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
    </div>
  );
};

export default UploadForm;
