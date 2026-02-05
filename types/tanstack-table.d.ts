import "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface TableMeta<TData> {
    updateAmount?: (userId: string, amount: number) => void;
  }
}