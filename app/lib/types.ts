export interface FileItem {
  name: string;
  content: string;
}

export interface Message {
  role: "user" | "ai";
  text: string;
}

export type AppMode = "chat" | "edit";
export type AppView = "chat" | "files";