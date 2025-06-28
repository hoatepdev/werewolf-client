export type Player = {
  id: number;
  name: string;
  status: "pending" | "approved" | "rejected";
  alive: boolean;
};
