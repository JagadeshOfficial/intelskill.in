import { useState } from "react";

export default function TutorContentActions({ item, onUpdated, onDeleted }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description);
  const [loading, setLoading] = useState(false);

  function handleEdit() {
    setEditing(true);
  }

  async function handleSave() {
    setLoading(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("tutorToken") : null;
    await fetch(`/api/v1/tutor/content/${item.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ title, description })
      });
    setEditing(false);
    setLoading(false);
    onUpdated();
  }

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this content?")) return;
    setLoading(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("tutorToken") : null;
    await fetch(`/api/v1/tutor/content/${item.id}`,
      {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
    setLoading(false);
    onDeleted();
  }

  function handleCopyLink() {
    const link = `https://drive.google.com/file/d/${item.driveFileId}/preview`;
    navigator.clipboard.writeText(link);
    alert("Link copied!");
  }

  return (
    <div className="flex gap-2 mt-2">
      <button onClick={handleEdit} disabled={editing}>Edit</button>
      <button onClick={handleDelete} disabled={loading}>Delete</button>
      <button onClick={handleCopyLink}>Share</button>
      {editing && (
        <div className="flex flex-col gap-2 mt-2">
          <input value={title} onChange={e => setTitle(e.target.value)} />
          <textarea value={description} onChange={e => setDescription(e.target.value)} />
          <button onClick={handleSave} disabled={loading}>Save</button>
          <button onClick={() => setEditing(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}
