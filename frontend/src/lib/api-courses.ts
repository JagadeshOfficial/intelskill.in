// Example API integration for frontend (React/Next.js)

export async function getCourses(): Promise<any> {
  const res = await fetch("http://localhost:8081/api/courses");
  return res.json();
}

export async function createCourse(course: { title: string; description: string }): Promise<any> {
  const res = await fetch("http://localhost:8081/api/courses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(course),
  });
  return res.json();
}

export async function getBatches(courseId: string | number): Promise<any> {
  const res = await fetch(`http://localhost:8081/api/courses/${courseId}/batches`);
  return res.json();
}

export async function createBatch(courseId: string | number, batch: { name: string }): Promise<any> {
  const res = await fetch(`http://localhost:8081/api/courses/${courseId}/batches`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(batch),
  });
  return res.json();
}

// Delete a batch
export async function deleteBatch(courseId: string | number, batchId: string | number): Promise<any> {
  const res = await fetch(`http://localhost:8081/api/courses/${courseId}/batches/${batchId}`, {
    method: "DELETE",
  });
  return res.json();
}

// Update (rename) a batch
export async function updateBatch(courseId: string | number, batchId: string | number, updated: { name?: string }): Promise<any> {
  const res = await fetch(`http://localhost:8081/api/courses/${courseId}/batches/${batchId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updated),
  });
  return res.json();
}

export async function addStudentToBatch(courseId: string | number, batchId: string | number, email: string): Promise<any> {
  const res = await fetch(`http://localhost:8081/api/courses/${courseId}/batches/${batchId}/students`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(email),
  });
  return res.json();
}

export async function removeStudentFromBatch(courseId: string | number, batchId: string | number, email: string): Promise<any> {
  const res = await fetch(`http://localhost:8081/api/courses/${courseId}/batches/${batchId}/students/${email}`, {
    method: "DELETE"
  });
  return res.json();
}

// Delete a course
export async function deleteCourse(courseId: string | number): Promise<any> {
  const res = await fetch(`http://localhost:8081/api/courses/${courseId}`, {
    method: "DELETE"
  });
  return res.json();
}

// Update (rename) a course
export async function updateCourse(courseId: string | number, updatedCourse: { title?: string; description?: string }): Promise<any> {
  const res = await fetch(`http://localhost:8081/api/courses/${courseId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedCourse),
  });
  return res.json();
}
