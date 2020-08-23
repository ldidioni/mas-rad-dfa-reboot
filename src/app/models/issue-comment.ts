export class IssueComment
{
    readonly id: string;
    readonly authorHref: string;
    readonly createdAt: string;
    text: string;
    author?: Author;    // to support respective "include" query parameter
}

class Author
{
    name: string;
}