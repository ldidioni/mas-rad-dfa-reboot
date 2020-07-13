export type Role = "citizen" | "staff";

export class User
{
    readonly id: string;
    readonly href: string;
    name: string;
    firstname: string;
    lastname: string;
    phone?: string;
    roles: Role[];
}