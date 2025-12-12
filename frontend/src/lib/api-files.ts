// frontend/src/lib/api-files.ts

export async function getFiles(folderId) {
  const res = await fetch(`http://localhost:8081/api/batches/folders/${folderId}/files`);
  return res.json();
}

export async function uploadFile(file: File, courseId: string, folderId?: number) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("courseId", courseId);
  formData.append("assignmentType", "resource"); // Default
  if (folderId) formData.append("folderId", folderId.toString());

  const token = localStorage.getItem("token"); // Assuming token is stored here

  const res = await fetch(`http://localhost:8081/api/v1/tutor/content/upload`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    },
    body: formData
  });
  return res.json();
}
