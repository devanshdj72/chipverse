declare namespace Express {
  interface User {
    userId: string;
    email?: string;
    role: string;
  }

  interface Request {
    user?: {
      userId: string;
      email?: string;
      role: string;
    };
  }
}