export type Role = 'CLIENT' | 'SELLER'

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
    avatar: string | null;
    createdAt: string;
    updatedAt: string;
}