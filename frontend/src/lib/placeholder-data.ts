import type { ImagePlaceholder } from './placeholder-images';
import { PlaceHolderImages } from './placeholder-images';
import { SiReact, SiNodedotjs, SiMongodb, SiExpress, SiPython, SiDjango, SiPandas, SiNumpy, SiAmazon, SiDocker, SiSpringboot, SiHibernate, SiPostgresql, SiTypescript } from 'react-icons/si';
import { FaDatabase, FaBrain, FaJava } from 'react-icons/fa';

export interface Content {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'document';
  duration?: string; // e.g., "12:34" for videos
  imageId: string;
  image: ImagePlaceholder;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  lessons: number;
  duration: string; // e.g., "5h 30m"
  price: number;
  imageId: string;
  image: ImagePlaceholder;
  longDescription: string;
  learnPoints: string[];
  tools: { name: string; icon: React.ComponentType<{ className?: string }> }[];
  curriculum: {
    module: string;
    lessons: { title: string; duration: string }[];
  }[];
}

export const getImage = (id: string): ImagePlaceholder => {
    const img = PlaceHolderImages.find(p => p.id === id);
    if (!img) {
        return {
            id: 'default',
            description: 'Default image',
            imageUrl: 'https://picsum.photos/seed/default/600/400',
            imageHint: 'placeholder'
        }
    }
    return img;
}

export const contentData: Content[] = [
  {
    id: '1',
    title: 'Introduction to React Hooks',
    description: 'Learn the fundamentals of React Hooks and how they can simplify your component logic.',
    type: 'video',
    duration: '24:15',
    imageId: 'content_1',
    image: getImage('content_1'),
  },
  {
    id: '2',
    title: 'Advanced CSS and Sass',
    description: 'Dive deep into modern CSS features and learn how to use Sass for more maintainable stylesheets.',
    type: 'video',
    duration: '45:50',
    imageId: 'content_2',
    image: getImage('content_2'),
  },
  {
    id: '3',
    title: 'Collaborative Coding Best Practices',
    description: 'A comprehensive guide on how to effectively collaborate with your team on coding projects.',
    type: 'document',
    imageId: 'content_3',
    image: getImage('content_3'),
  },
  {
    id: '4',
    title: 'Understanding Asynchronous JavaScript',
    description: 'From callbacks to Promises and async/await, this video covers it all.',
    type: 'video',
    duration: '32:08',
    imageId: 'content_4',
    image: getImage('content_4'),
  },
  {
    id: '5',
    title: 'Data Structures in Python',
    description: 'Explore common data structures and their implementation in Python for optimal performance.',
    type: 'document',
    imageId: 'content_5',
    image: getImage('content_5'),
  },
  {
    id: '6',
    title: 'Building a REST API with Node.js',
    description: 'Step-by-step tutorial on creating a robust REST API using Node.js and Express.',
    type: 'video',
    duration: '58:22',
    imageId: 'content_6',
    image: getImage('content_6'),
  },
];

export const coursesData: Course[] = [
  {
    id: 'course_java',
    title: 'Java Full Stack Development',
    description: 'Become a full-stack Java developer. Master Spring Boot, Hibernate, and modern frontend frameworks like React.',
    level: 'Advanced',
    lessons: 60,
    duration: '45h',
    price: 499,
    imageId: 'course_java',
    image: getImage('course_java'),
    longDescription: 'This comprehensive course covers everything you need to become a proficient full-stack Java developer. Starting with the fundamentals of modern Java, you will dive deep into building robust backends with Spring Boot and managing databases with Hibernate. The course concludes by teaching you how to build dynamic user interfaces with React and integrate them with your Java backend.',
    learnPoints: [
      'Build enterprise-grade backend services with Spring Boot.',
      'Master Object-Relational Mapping (ORM) with Hibernate.',
      'Develop modern, responsive UIs with React.',
      'Secure and deploy full-stack Java applications.',
      'Understand database design and management with PostgreSQL.',
    ],
    tools: [
      { name: 'Java', icon: FaJava },
      { name: 'Spring Boot', icon: SiSpringboot },
      { name: 'Hibernate', icon: SiHibernate },
      { name: 'React', icon: SiReact },
      { name: 'PostgreSQL', icon: SiPostgresql },
    ],
    curriculum: [
      {
        module: 'Module 1: Core Java Concepts',
        lessons: [
          { title: 'Introduction to Java', duration: '45m' },
          { title: 'OOP Principles', duration: '1h 30m' },
        ],
      },
      {
        module: 'Module 2: Spring Boot',
        lessons: [
          { title: 'Building your first REST API', duration: '2h' },
          { title: 'Dependency Injection and IoC', duration: '1h 45m' },
        ],
      },
       {
        module: 'Module 3: React Frontend',
        lessons: [
          { title: 'React Fundamentals', duration: '2h 30m' },
          { title: 'State Management with Hooks', duration: '2h' },
        ],
      },
    ],
  },
  {
    id: 'course_python',
    title: 'Python Full Stack with Django',
    description: 'Build powerful web applications from backend to frontend using Python, Django, and modern JavaScript.',
    level: 'Intermediate',
    lessons: 55,
    duration: '40h',
    price: 449,
    imageId: 'course_python',
    image: getImage('course_python'),
    longDescription: 'Master the art of web development with Python and Django. This course takes you from the basics of Django to building a complete, production-ready web application. You will learn about Django\'s MVT architecture, build APIs with Django REST Framework, and create a dynamic frontend.',
    learnPoints: [
      'Understand the fundamentals of the Django framework.',
      'Build and test robust APIs using Django REST Framework.',
      'Implement user authentication and permissions.',
      'Design database models and manage migrations.',
      'Deploy a full-stack Django application to the cloud.',
    ],
    tools: [
      { name: 'Python', icon: SiPython },
      { name: 'Django', icon: SiDjango },
      { name: 'PostgreSQL', icon: SiPostgresql },
      { name: 'React', icon: SiReact },
    ],
    curriculum: [
      {
        module: 'Module 1: Django Fundamentals',
        lessons: [
          { title: 'Introduction to Django', duration: '1h' },
          { title: 'Models and Databases', duration: '2h' },
        ],
      },
      {
        module: 'Module 2: Django REST Framework',
        lessons: [
          { title: 'Serializers', duration: '1h 30m' },
          { title: 'Views and Routers', duration: '2h' },
        ],
      },
    ],
  },
  {
    id: 'course_analytics',
    title: 'Python for Data Analytics',
    description: 'Unlock insights from data. Learn Pandas, NumPy, and data visualization libraries to become a data expert.',
    level: 'Intermediate',
    lessons: 40,
    duration: '30h',
    price: 349,
    imageId: 'course_analytics',
    image: getImage('course_analytics'),
    longDescription: 'Turn data into actionable insights with Python. This course provides a deep dive into the essential libraries for data analysis and visualization. You will work with real-world datasets to clean, process, analyze, and visualize data, building a strong portfolio of analytics projects.',
    learnPoints: [
      'Manipulate and clean data effectively with Pandas.',
      'Perform complex numerical operations with NumPy.',
      'Create compelling data visualizations with Matplotlib and Seaborn.',
      'Understand statistical analysis techniques.',
      'Complete a capstone project using a real-world dataset.',
    ],
    tools: [
      { name: 'Python', icon: SiPython },
      { name: 'Pandas', icon: SiPandas },
      { name: 'NumPy', icon: SiNumpy },
    ],
    curriculum: [
      {
        module: 'Module 1: Introduction to Data Analytics',
        lessons: [
          { title: 'The Data Analytics Lifecycle', duration: '1h' },
          { title: 'Setting up your Python Environment', duration: '45m' },
        ],
      },
      {
        module: 'Module 2: Pandas In-Depth',
        lessons: [
          { title: 'DataFrames and Series', duration: '2h' },
          { title: 'Data Cleaning and Preprocessing', duration: '2h 30m' },
        ],
      },
    ],
  },
  {
    id: 'course_devops',
    title: 'DevOps with AWS',
    description: 'Master the art of DevOps. Implement CI/CD pipelines, containerization with Docker, and infrastructure as code on AWS.',
    level: 'Advanced',
    lessons: 65,
    duration: '50h',
    price: 549,
    imageId: 'course_devops',
    image: getImage('course_devops'),
    longDescription: 'This course is your complete guide to becoming a DevOps engineer. You will learn the principles of CI/CD, how to containerize applications with Docker and orchestrate them with Kubernetes, and how to manage infrastructure as code using Terraform. All concepts are taught using Amazon Web Services (AWS).',
    learnPoints: [
      'Master CI/CD principles and tools like Jenkins or GitHub Actions.',
      'Containerize applications using Docker.',
      'Understand infrastructure as code with Terraform.',
      'Deploy and manage applications on AWS.',
      'Implement monitoring and logging for production systems.',
    ],
    tools: [
      { name: 'AWS', icon: SiAmazon },
      { name: 'Docker', icon: SiDocker },
    ],
    curriculum: [
      {
        module: 'Module 1: Introduction to DevOps',
        lessons: [
          { title: 'What is DevOps?', duration: '1h' },
          { title: 'The DevOps Lifecycle', duration: '1h 30m' },
        ],
      },
      {
        module: 'Module 2: Containerization with Docker',
        lessons: [
          { title: 'Introduction to Docker', duration: '2h' },
          { title: 'Creating Dockerfiles', duration: '2h 30m' },
        ],
      },
    ],
  },
  {
    id: 'course_mern',
    title: 'MERN Stack Mastery',
    description: 'Build dynamic, single-page applications with the most popular JavaScript stack: MongoDB, Express, React, and Node.js.',
    level: 'Beginner',
    lessons: 50,
    duration: '35h',
    price: 399,
    imageId: 'course_mern',
    image: getImage('course_mern'),
    longDescription: 'This course will teach you how to build a complete, full-stack MERN application from scratch. You will learn how to build a RESTful API with Node.js and Express, design a flexible database schema with MongoDB, and create a dynamic user interface with React. By the end, you\'ll have a portfolio-ready project to showcase your skills.',
    learnPoints: [
      'Build a complete backend API with Node.js and Express.',
      'Design NoSQL databases with MongoDB and Mongoose.',
      'Create interactive and stateful UIs with React.',
      'Manage application state with React Hooks and Context.',
      'Implement user authentication with JWT and bcrypt.',
    ],
    tools: [
      { name: 'MongoDB', icon: SiMongodb },
      { name: 'Express', icon: SiExpress },
      { name: 'React', icon: SiReact },
      { name: 'Node.js', icon: SiNodedotjs },
    ],
    curriculum: [
      {
        module: 'Module 1: Backend with Node.js & Express',
        lessons: [
          { title: 'Creating your Express Server', duration: '1h 30m' },
          { title: 'Building RESTful Routes', duration: '2h' },
        ],
      },
      {
        module: 'Module 2: Database with MongoDB',
        lessons: [
          { title: 'Introduction to NoSQL', duration: '1h' },
          { title: 'Schema Design with Mongoose', duration: '2h' },
        ],
      },
      {
        module: 'Module 3: Frontend with React',
        lessons: [
          { title: 'Component-Based Architecture', duration: '2h' },
          { title: 'Fetching Data from your API', duration: '1h 30m' },
        ],
      },
    ],
  },
  {
    id: 'course_datascience_genai',
    title: 'Data Science with Gen AI',
    description: 'Explore the intersection of Data Science and Generative AI. Learn to build and deploy intelligent applications.',
    level: 'Advanced',
    lessons: 70,
    duration: '55h',
    price: 599,
    imageId: 'course_datascience_genai',
    image: getImage('course_datascience_genai'),
    longDescription: 'Dive into the exciting world of Generative AI and its applications in data science. This advanced course covers the fundamentals of large language models (LLMs), prompt engineering, and fine-tuning. You will learn how to leverage powerful APIs to build intelligent applications that can generate text, analyze sentiment, and much more.',
    learnPoints: [
      'Understand the architecture of Large Language Models (LLMs).',
      'Master advanced prompt engineering techniques.',
      'Fine-tune pre-trained models for specific tasks.',
      'Build applications using modern Gen AI frameworks.',
      'Explore the ethical considerations of generative AI.',
    ],
    tools: [
      { name: 'Python', icon: SiPython },
      { name: 'Generative AI', icon: FaBrain },
      { name: 'TypeScript', icon: SiTypescript },
    ],
    curriculum: [
      {
        module: 'Module 1: Foundations of Generative AI',
        lessons: [
          { title: 'History and Evolution of LLMs', duration: '1h 30m' },
          { title: 'The Transformer Architecture', duration: '2h' },
        ],
      },
      {
        module: 'Module 2: Prompt Engineering',
        lessons: [
          { title: 'Zero-shot and Few-shot Prompting', duration: '2h' },
          { title: 'Chain-of-Thought and Self-Consistency', duration: '2h 30m' },
        ],
      },
      {
        module: 'Module 3: Building with Gen AI',
        lessons: [
          { title: 'Using AI SDKs and APIs', duration: '3h' },
          { title: 'Capstone Project', duration: '5h' },
        ],
      },
    ],
  },
];


const fiveMinAgo = new Date(new Date().getTime() - 5 * 60 * 1000);
const oneHourAgo = new Date(new Date().getTime() - 60 * 60 * 1000);
const threeHoursAgo = new Date(new Date().getTime() - 3 * 60 * 60 * 1000);
const oneDayAgo = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
const twoDaysAgo = new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000);

export interface ForumPost {
    id: string;
    author: { name: string; avatarUrl: string };
    timestamp: Date;
    content: string;
}

export interface ForumThread {
    id: string;
    title: string;
    author: { name: string; avatarUrl: string };
    timestamp: Date;
    repliesCount: number;
    lastReply: { authorName: string; timestamp: Date };
    posts: ForumPost[];
}

export const forumData: ForumThread[] = [
    {
        id: '1',
        title: 'How to manage state in large React applications?',
        author: { name: 'Alice', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
        timestamp: oneDayAgo,
        repliesCount: 2,
        lastReply: { authorName: 'Charlie', timestamp: threeHoursAgo },
        posts: [
            { id: 'p1-1', author: { name: 'Alice', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' }, timestamp: oneDayAgo, content: 'I\'m working on a large-scale React project and struggling with state management. Redux seems too boilerplate-y. What are the modern alternatives? I\'ve heard about Zustand and Jotai. Any recommendations?' },
            { id: 'p1-2', author: { name: 'Bob', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e290267072' }, timestamp: oneHourAgo, content: 'Zustand is great for its simplicity! It uses a hook-based API that feels very "React". I\'ve used it on several projects and it scales well without the complexity of Redux.' },
            { id: 'p1-3', author: { name: 'Charlie', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026707e' }, timestamp: fiveMinAgo, content: 'I agree with Bob. For component-local state that needs to be shared, Jotai is also a fantastic option. It follows an atom-based approach which can be more intuitive for certain use cases. I would recommend trying both on a small scale to see which you prefer.' },
        ]
    },
    {
        id: '2',
        title: 'Best practices for REST API design',
        author: { name: 'David', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026707f' },
        timestamp: twoDaysAgo,
        repliesCount: 1,
        lastReply: { authorName: 'Eve', timestamp: oneDayAgo },
        posts: [
            { id: 'p2-1', author: { name: 'David', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026707f' }, timestamp: twoDaysAgo, content: 'What are some key principles for designing clean, scalable, and easy-to-use REST APIs? I\'m particularly interested in versioning strategies and how to handle nested resources.' },
            { id: 'p2-2', author: { name: 'Eve', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026708a' }, timestamp: oneDayAgo, content: 'Great question! For versioning, I recommend using a URI path prefix, like `/api/v1/...`. It\'s explicit and clear. For nested resources, use them sparingly to avoid overly complex URLs. For example, `GET /users/123/posts` is good, but `GET /users/123/posts/456/comments` might be better as `GET /posts/456/comments`.' },
        ]
    },
    {
        id: '3',
        title: 'Is Tailwind CSS worth it for small projects?',
        author: { name: 'Frank', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026708b' },
        timestamp: threeHoursAgo,
        repliesCount: 0,
        lastReply: { authorName: 'Frank', timestamp: threeHoursAgo },
        posts: [
            { id: 'p3-1', author: { name: 'Frank', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026708b' }, timestamp: threeHoursAgo, content: 'I\'m starting a small portfolio website. Is the setup and learning curve for Tailwind CSS justified, or should I stick to plain CSS or a component library like Bootstrap?' }
        ]
    },
];

export const getThreadById = (id: string): ForumThread | undefined => {
    return forumData.find(thread => thread.id === id);
}

export const getCourseById = (id: string): Course | undefined => {
    return coursesData.find(course => course.id === id);
};
