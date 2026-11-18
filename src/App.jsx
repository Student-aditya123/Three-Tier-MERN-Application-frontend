
import { useEffect, useState } from "react";
import "./App.css";

const STUDENT_API = "/api/students";
const FILE_API = "/api/files";
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function App() {
  // Student states
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    course: ""
  });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");

  // File states
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fileMessage, setFileMessage] = useState("");
  const [fileError, setFileError] = useState("");
  const [downloadingId, setDownloadingId] = useState(null);

  // Load students
  const loadStudents = async () => {
    try {
      const res = await fetch(STUDENT_API);
      if (!res.ok) throw new Error("Unable to load students");

      setStudents(await res.json());
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  // Load uploaded files
  const loadFiles = async () => {
    try {
      const res = await fetch(FILE_API);
      if (!res.ok) throw new Error("Unable to load files");

      setFiles(await res.json());
      setFileError("");
    } catch (err) {
      setFileError(err.message);
    }
  };

  useEffect(() => {
    loadStudents();
    loadFiles();
  }, []);

  // Student CRUD
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(
        editId ? `${STUDENT_API}/${editId}` : STUDENT_API,
        {
          method: editId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(form)
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Request failed");
      }

      setForm({ name: "", email: "", course: "" });
      setEditId(null);
      setError("");
      loadStudents();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (student) => {
    setForm({
      name: student.name,
      email: student.email,
      course: student.course
    });
    setEditId(student._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this student?")) return;

    try {
      const res = await fetch(`${STUDENT_API}/${id}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Delete failed");

      loadStudents();
    } catch (err) {
      setError(err.message);
    }
  };

  // File selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    setFileMessage("");
    setFileError("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null);
      setFileError("File size must be 10 MB or less.");
      e.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  // Upload file to S3
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setFileError("Please select a file first.");
      return;
    }

    setUploading(true);
    setFileError("");
    setFileMessage("");

    try {
      // Step 1: Request a pre-signed upload URL
      const urlResponse = await fetch(`${FILE_API}/upload-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fileName: selectedFile.name,
          contentType: selectedFile.type || "application/octet-stream",
          size: selectedFile.size
        })
      });

      const urlData = await urlResponse.json();

      if (!urlResponse.ok) {
        throw new Error(urlData.error || urlData.message || "Could not generate upload URL");
      }

      // Step 2: Upload directly to private S3 bucket
      const uploadResponse = await fetch(urlData.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": selectedFile.type || "application/octet-stream"
        },
        body: selectedFile
      });

      if (!uploadResponse.ok) {
        throw new Error(`S3 upload failed: ${uploadResponse.status}`);
      }

      // Step 3: Save file metadata in MongoDB
      const confirmResponse = await fetch(`${FILE_API}/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          key: urlData.key,
          fileName: urlData.fileName,
          contentType: urlData.contentType,
          size: selectedFile.size
        })
      });

      const confirmData = await confirmResponse.json();

      if (!confirmResponse.ok) {
        throw new Error(confirmData.error || confirmData.message || "Could not save file metadata");
      }

      setFileMessage("File uploaded successfully!");
      setSelectedFile(null);

      const input = document.getElementById("file-input");
      if (input) input.value = "";

      await loadFiles();

    } catch (err) {
      setFileError(err.message);
    } finally {
      setUploading(false);
    }
  };

  // Download file through a temporary pre-signed URL
  const handleDownload = async (id) => {
    setDownloadingId(id);
    setFileError("");

    try {
      const res = await fetch(`${FILE_API}/${id}/download-url`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Could not generate download URL");
      }

      if (!data.downloadUrl) {
        throw new Error("Download URL missing from backend response");
      }

      window.location.assign(data.downloadUrl);

    } catch (err) {
      setFileError(err.message);
    } finally {
      setDownloadingId(null);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <main className="container">
      <header className="header">
        <h1>Student Management System</h1>
        <p>Three-Tier MERN Application on AWS EC2</p>
        <div className="architecture">
          React + Node.js + MongoDB + AWS S3
        </div>
      </header>

      {/* Student Management */}
      <section className="section">
        <h2>Student Management</h2>

        <form onSubmit={handleSubmit} className="student-form">
          <input
            placeholder="Student Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
          />

          <input
            placeholder="Course"
            value={form.course}
            onChange={e => setForm({ ...form, course: e.target.value })}
            required
          />

          <button type="submit">
            {editId ? "Update Student" : "Add Student"}
          </button>

          {editId && (
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setEditId(null);
                setForm({ name: "", email: "", course: "" });
              }}
            >
              Cancel
            </button>
          )}
        </form>

        {error && <p className="error">{error}</p>}

        <h3>All Students ({students.length})</h3>

        {students.length === 0 && <p>No students found.</p>}

        {students.map(student => (
          <div className="student" key={student._id}>
            <div className="student-info">
              <strong>{student.name}</strong>
              <p>{student.email} | {student.course}</p>
            </div>

            <div className="student-actions">
              <button onClick={() => handleEdit(student)}>
                Edit
              </button>

              <button
                className="danger-button"
                onClick={() => handleDelete(student._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* AWS S3 File Management */}
      <section className="section file-section">
        <h2>AWS S3 File Management</h2>

        <p className="section-description">
          Upload files to a private AWS S3 bucket and store metadata in MongoDB.
        </p>

        <form onSubmit={handleUpload} className="upload-form">
          <label htmlFor="file-input" className="file-label">
            Select a file
          </label>

          <input
            id="file-input"
            type="file"
            onChange={handleFileChange}
          />

          {selectedFile && (
            <div className="selected-file">
              <strong>{selectedFile.name}</strong>
              <span>{formatSize(selectedFile.size)}</span>
            </div>
          )}

          <p className="hint">Maximum file size: 10 MB</p>

          <button type="submit" disabled={!selectedFile || uploading}>
            {uploading ? "Uploading..." : "Upload to AWS S3"}
          </button>
        </form>

        {fileMessage && <p className="success">{fileMessage}</p>}
        {fileError && <p className="error">{fileError}</p>}

        <div className="files-header">
          <h3>Uploaded Files ({files.length})</h3>

          <button
            type="button"
            className="secondary-button"
            onClick={loadFiles}
          >
            Refresh
          </button>
        </div>

        {files.length === 0 && <p>No uploaded files found.</p>}

        {files.map(file => (
          <div className="file-item" key={file._id}>
            <div className="file-info">
              <strong>{file.originalName}</strong>
              <p>
                {formatSize(file.size)} ·{" "}
                {new Date(file.uploadedAt).toLocaleString()}
              </p>
            </div>

            <button
              type="button"
              disabled={downloadingId === file._id}
              onClick={() => handleDownload(file._id)}
            >
              {downloadingId === file._id ? "Loading..." : "Download"}
            </button>
          </div>
        ))}
      </section>

      <footer>
        Built with React, Node.js, MongoDB, AWS EC2, IAM and S3
      </footer>
    </main>
  );
}

export default App;
