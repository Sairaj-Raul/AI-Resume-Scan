// components/ResultCard.jsx
export default function ResultCard({ result }) {
  return (
    <div className="p-4 border rounded-lg shadow bg-gray-50">
      <h2 className="text-xl font-semibold mb-2">{result.candidateName}</h2>
      <p className="font-medium">
        Score: <span className="text-blue-600">{result.score}</span>
      </p>

      <div className="mt-2">
        <h3 className="font-semibold">✅ Good Points</h3>
        <ul className="list-disc list-inside text-green-700">
          {result.goodPoints.map((point, i) => (
            <li key={i}>{point}</li>
          ))}
        </ul>
      </div>

      <div className="mt-2">
        <h3 className="font-semibold">⚠️ Bad Points</h3>
        <ul className="list-disc list-inside text-red-700">
          {result.badPoints.map((point, i) => (
            <li key={i}>{point}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
