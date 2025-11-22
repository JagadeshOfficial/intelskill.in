import { useEffect, useState } from "react";

export default function TutorContentList() {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);

  function fetchContents() {
    const token = typeof window !== "undefined" ? localStorage.getItem("tutorToken") : null;
    if (!token) return;
    fetch("/api/v1/tutor/content", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setContents(data);
        setLoading(false);
      });
  }
  useEffect(() => { fetchContents(); }, []);

  if (loading) return <div>Loading content...</div>;
  if (!contents.length) return <div>No content uploaded yet.</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">My Uploaded Content</h2>
      <ul className="space-y-6">
        {contents.map((item: any) => (
          <li key={item.id} className="border p-4 rounded">
            <div className="font-semibold">{item.title}</div>
            <div className="text-sm text-muted-foreground mb-2">{item.description}</div>
            {item.driveFileId && (
              <iframe
                src={`https://drive.google.com/file/d/${item.driveFileId}/preview`}
                width="640"
                height="360"
                allow="autoplay"
                title={item.title}
              />
            )}
            <TutorContentActions item={item} onUpdated={fetchContents} onDeleted={fetchContents} />
          </li>
        ))}
      </ul>
    </div>
  );
}
