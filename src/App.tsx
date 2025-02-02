import { useState, useEffect } from "react";
import axios from "axios";
import debounce from "lodash.debounce";

interface IStudent {
  name: string;
  class: string;
  rollNumber: string;
}
// ✅ Automatically set API base URL based on the environment
const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api" // Local backend
    : "https://punjabsoft-assign-be.vercel.app/api"; // Deployed backend
export default function App() {
  const [query, setQuery] = useState("");
  const [students, setStudents] = useState<IStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<IStudent | null>(null);

  // Fetch students with debounce
  const fetchStudents = debounce(async (searchTerm: string) => {
    if (searchTerm.length < 3) {
      setStudents([]);
      return;
    }

    try {
      const res = await axios.get(
        `${API_BASE_URL}/students?query=${searchTerm}`
      );
      setStudents(res.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  }, 300); // 300ms debounce

  useEffect(() => {
    fetchStudents(query);
  }, [query]);

  // Function to highlight matching text
  const highlightMatch = (text: string, highlight: string) => {
    if (!highlight) return text;

    const regex = new RegExp(`(${highlight})`, "gi"); // Case-insensitive match
    const parts = text.split(regex);

    return parts.map((part, index) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <span key={index} className="text-yellow-500 font-bold">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-4xl font-bold text-blue-400 mb-6">Student Search</h1>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search for a student..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-96 p-4 text-lg rounded-xl border-2 border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-300"
      />

      {/* Dropdown Results */}
      {students.length > 0 && (
        <ul className="w-96 bg-white text-gray-900 mt-4 rounded-xl shadow-lg overflow-hidden">
          {students.map((student: IStudent) => (
            <li
              key={student.rollNumber}
              onClick={() => setSelectedStudent(student)}
              className="p-4 text-lg hover:bg-blue-100 transition-all cursor-pointer"
            >
              {highlightMatch(student.name, query)}
            </li>
          ))}
        </ul>
      )}

      {/* Selected Student Details */}
      {selectedStudent && (
        <div className="w-96 bg-blue-500 mt-6 p-6 rounded-xl shadow-lg text-center">
          <h2 className="text-3xl font-bold">{selectedStudent.name}</h2>
          <p className="text-xl">Class: {selectedStudent.class}</p>
          <p className="text-xl">Roll Number: {selectedStudent.rollNumber}</p>
        </div>
      )}
    </div>
  );
}
