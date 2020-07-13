export type Type = "start" | "reject" | "resolve";

export class IssueAction
{
    readonly id: string;
    readonly authorHref: string;
    readonly createdAt: string;
    readonly href: string;
    readonly issueHref: string;
    readonly userHref: string;
    type: Type;
    reason?: string;
}
