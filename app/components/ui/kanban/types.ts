export interface KannbanTasks {
  id: string;
  title: string;
  date: string;
}
export interface KannbanColumns {
  todo: {
    name: string;
    items: KannbanTasks[];
  };
  inprogress: {
    name: string;
    items: KannbanTasks[];
  };
  finished: {
    name: string;
    items: KannbanTasks[];
  };
  undefined: {
    name: string;
    items: KannbanTasks[];
  };
}
