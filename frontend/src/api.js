const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function searchStudents({ name, student_id, year }) {
  const params = new URLSearchParams();
  if (name) params.set('name', name);
  if (student_id) params.set('student_id', student_id);
  if (year) params.set('year', year);
  const res = await fetch(`${BASE}/search?${params}`);
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

export async function getStudent(id) {
  const res = await fetch(`${BASE}/student/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error('Student not found');
  return res.json();
}
