import { IssueType } from './issue-type';

export class Issue
{
    readonly assigneeHref: string;
    readonly createdAt: string;
    readonly creatorHref: string;
    readonly href: string;
    readonly id: string;
    readonly state: string;
    readonly updatedAt: string;
    issueTypeHref: string;
    location: Point;
    description?: string;
    imageUrl?: string;
    additionalImageUrls?: string[];
    tags?: string[];
    issueType?: IssueType;  // support for include statements
    creator?: IssueType;    // support for include statements
}

export class Point
{
    type: "Point";
    coordinates: [number, number];

    constructor(coordinates: [number, number])
    {
        this.type = "Point";
        this.coordinates = coordinates;
    }
}

export type state =  "new" | "inProgress" | "rejected" | "resolved";