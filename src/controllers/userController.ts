import { Request, Response } from 'express';

interface User {
  id: number;
  name: string;
  email: string;
}

export const getUsers = (req: Request, res: Response) => {
  const users: User[] = [
    { id: 1, name: 'Jane Doe', email: 'jane@example.com' },
    { id: 2, name: 'John Smith', email: 'john@example.com' }
  ];

  res.json({
    success: true,
    data: {
      users,
      totalCount: users.length
    },
    timestamp: new Date().toISOString()
  });
};