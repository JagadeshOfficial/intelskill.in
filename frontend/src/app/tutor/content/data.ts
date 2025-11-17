

export interface Batch {
  id: string;
  name: string;
}

export interface Course {
  id: string;
  title: string;
  batches: Batch[];
}

export interface Student {
    id: string;
    name: string;
}

export const tutorCourses: Course[] = [
  {
    id: "C001",
    title: "MERN Stack Mastery",
    batches: [
        { id: "C001-B1", name: "Batch 1 (Morning)" },
        { id: "C001-B2", name: "Batch 2 (Evening)" },
        { id: "C001-B3", name: "Batch 3 (Weekend)" },
    ]
  },
  {
    id: "C002",
    title: "Python for Data Analytics",
    batches: [
        { id: "C002-B1", name: "Batch A" },
        { id: "C002-B2", name: "Batch B" },
    ]
  },
];

export const tutorStudents: Student[] = [
    {
        id: "S001",
        name: "Alex Johnson",
    },
    {
        id: "S002",
        name: "Maria Garcia",
    },
    {
        id: "S003",
        name: "Sam Chen",
    },
    {
        id: "S004",
        name: "Emily White",
    }
]
