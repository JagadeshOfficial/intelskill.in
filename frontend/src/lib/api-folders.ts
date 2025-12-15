// frontend/src/lib/api-folders.ts

export async function createFolder(batchId: number, name: string, parentId: number | null = null) {
  const res = await fetch(`http://localhost:8081/api/batches/${batchId}/folders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, parentId }),
  });
  return res.json();
}

export async function getFolders(batchId: number) {
  const res = await fetch(`http://localhost:8081/api/batches/${batchId}/folders`);
  return res.json();
}

export async function deleteFolder(folderId: number) {
  // Backend exposes folder delete at /api/batches/folders/{folderId}
  const res = await fetch(`http://localhost:8081/api/batches/folders/${folderId}`, {
    method: "DELETE",
  });
  return res.json();
}

export async function updateFolder(folderId: number, name: string) {
  // Backend exposes folder update at /api/batches/folders/{folderId}
  const res = await fetch(`http://localhost:8081/api/batches/folders/${folderId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return res.json();
}
