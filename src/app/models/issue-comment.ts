export class IssueComment
{
    readonly id: string;
    readonly authorHref: string;
    readonly createdAt: string;
    text: string;
    author?: Author;    // to support include statement
}

class Author
{
    name: string;
}