export type NoticeCategory = "announcement" | "help" | "event" | "lost-found";

export type Notice = {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  category: NoticeCategory;
};

export const categoryLabels: Record<NoticeCategory, string> = {
  announcement: "Announcement",
  help: "Help needed",
  event: "Event",
  "lost-found": "Lost & found",
};

export const categoryStyles: Record<NoticeCategory, string> = {
  announcement: "bg-primary/10 text-primary",
  help: "bg-accent/10 text-accent",
  event: "bg-secondary/20 text-secondary-foreground",
  "lost-found": "bg-muted text-muted-foreground",
};

// Placeholder data until the Prisma/PostgreSQL layer is in place.
export const notices: Notice[] = [
  {
    id: 1,
    title: "Neighbour Evening Announcement",
    content:
      "You are welcome to the neighbour evening next Saturday at 6 PM in the housing association's club room!",
    author: "Mary Example",
    createdAt: "2025-04-24",
    category: "event",
  },
  {
    id: 2,
    title: "Lost & Found: Bicycle Key",
    content:
      "A bicycle key was found in the bike storage. You can pick it up from under the notice board in staircase A.",
    author: "Peter Example",
    createdAt: "2025-04-23",
    category: "lost-found",
  },
  {
    id: 3,
    title: "Help carrying a sofa on Sunday",
    content:
      "Moving in to apartment B 24 and the sofa will not fit up the stairs alone. Two pairs of hands for 15 minutes would save my back - coffee and pulla as payment.",
    author: "Anna Example",
    createdAt: "2025-04-22",
    category: "help",
  },
  {
    id: 4,
    title: "Water shut-off on Thursday 9-14",
    content:
      "The pipe maintenance continues in staircase A. Water will be off between 9 AM and 2 PM. Please store some drinking water in advance.",
    author: "Housing Association",
    createdAt: "2025-04-21",
    category: "announcement",
  },
  {
    id: 5,
    title: "Anyone have a drill I could borrow?",
    content:
      "Putting up shelves this weekend and would rather borrow than buy. Happy to return it the same day.",
    author: "Jonas Example",
    createdAt: "2025-04-20",
    category: "help",
  },
];

export function formatNoticeDate(createdAt: string) {
  return new Date(createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
