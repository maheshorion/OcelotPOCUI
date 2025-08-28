export interface Writer {
  id: string;
  name: string;
  bio: string;
  email: string;
  phone: string;
  profilePictureUrl: string;
  joinedDate: string;            // ISO date string
  articlesWritten: number;
  followers: number;
  isActive: boolean;
}
