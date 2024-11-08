export type ColId = string | number;
export type ColumnKannban = {
  id: ColId;
  title: string;
};

export type Task = {
  id: ColId;
  columnId: ColId;
  content: string;
};
