import { Plus, Trash } from "lucide-react";
import { Button } from "../button";
import { ColId, ColumnKannban, Task } from "./types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import TaskCard from "./task-card";
interface Props {
  column: ColumnKannban;
  deleteCol: (id: ColId) => void;
  updateCol: (id: ColId, title: string) => void;
  createTask: (columnId: ColId) => void;
  tasks: Array<Task>;
  deleteTask: (taskId: ColId) => void;
}

export function KannbanColumnContainer({
  column,
  deleteCol,
  updateCol,
  createTask,
  tasks,
  deleteTask,
}: Props) {
  const [editMode, setEditMode] = useState(false);

  const {
    setNodeRef,
    attributes,
    listeners,
    transition,
    transform,
    isDragging,
  } = useSortable({
    id: column.id,
    data: { type: "Column", column },
    disabled: editMode,
  });

  const style = { transition, transform: CSS.Transform.toString(transform) };

  if (isDragging)
    return (
      <div
        ref={setNodeRef}
        style={style}
        className=" opacity-40 border border-rose-500 bg-black w-[350px] h-[500px] max-h-[500] rounded-md flex flex-col "
      />
    );
  return (
    <div
      ref={setNodeRef}
      style={style}
      className=" bg-black w-[350px] h-[500px] max-h-[500] rounded-md flex flex-col "
    >
      <div
        {...attributes}
        {...listeners}
        className=" flex items-center justify-between bg-gray-800 text-md h-[60px] cursor-grab rounded-md rounded-b-none p-3 font-bold border-black border-4"
      >
        <div
          onClick={() => setEditMode(true)}
          className="flex gap-2 items-center"
        >
          <div className="flex justify-center items-center  bg-gray-900 rounded-full px-2 py-1 text-sm">
            0
          </div>

          {!editMode ? (
            <>{column.title}</>
          ) : (
            <input
              className="bg-black focus:border-rose-500 border-rounded outline-none px-2"
              value={column.title}
              onChange={(e) => {
                updateCol(column.id, e.target.value);
              }}
              autoFocus
              onBlur={() => {
                setEditMode(false);
              }}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                setEditMode(false);
              }}
            />
          )}
        </div>
        <Button onClick={() => deleteCol(column.id)} size="icon">
          <Trash />
        </Button>
      </div>

      <div className="flex flex-col gap-4 p-4 overflow-x-hidden  overflow-y-auto flex-grow">
        {tasks.map((task) => (
          <TaskCard deleteTask={deleteTask} task={task} />
        ))}
      </div>

      <div className="flex">
        <Button
          onClick={() => {
            createTask(column.id);
          }}
          className=" w-full bg-black text-white hover:text-black"
        >
          <Plus />
          Add Task
        </Button>
      </div>
    </div>
  );
}
