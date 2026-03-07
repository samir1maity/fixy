export interface User {
    id: string;
    email: string;
    name: string;
    orgName?: string | null;
    password: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
}