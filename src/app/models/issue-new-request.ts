import { Point } from './issue';


export class IssueNewRequest
{
    issueTypeHref: string;
    location: Point;
    description?: string;
    imageUrl?: string;
    additionalImageUrls?: string[];
    tags?: string[];
    //createdAt?: string;

    constructor()
    {
        this.issueTypeHref = null;
        this.location = null;
        this.description = null;
        this.imageUrl = null;
        this.additionalImageUrls = null;
        this.tags = null;
        //this.createdAt = null;
    }
}