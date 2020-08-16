export class IssueComment
{
    readonly id: string;
    readonly authorHref: string;
    readonly createdAt: string;
    text: string;
    author?: string;    // to support include statement
}
