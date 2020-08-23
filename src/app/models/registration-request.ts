export class RegistrationRequest
{
    name: string;
    password: string;
    firstname: string;
    lastname: string;
    phone: string;
    roles: string[];

    constructor()
    {
        this.name = null;
        this.password = null;
        this.firstname = null;
        this.lastname = null;
        this.phone = null;
        this.roles = ['citizen'];   // enforces that the created user is and only is a citizen
    }
}