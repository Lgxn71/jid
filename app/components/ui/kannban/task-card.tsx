import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";

import { Trash } from "lucide-react";
import { Button } from "../button";
import { ColId, Task } from "./types";

import { CSS } from "@dnd-kit/utilities";

interface Props {
  task: Task;
  deleteTask: (id: ColId) => void;
  updateTask: (id: ColId, content: string) => void;
}
function TaskCard({ task, deleteTask, updateTask }: Props) {
  const [mouseIsOver, setMouseIsOver] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const {
    setNodeRef,
    attributes,
    listeners,
    transition,
    transform,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: "Task", task },
    disabled: editMode,
  });

  const style = { transition, transform: CSS.Transform.toString(transform) };

  const toggleEditMode = () => {
    setEditMode((prev) => !prev);
    setMouseIsOver(false);
  };

  if (isDragging)
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-gray-800 p-2.5 h-[100px] min-h-[100px] items-center flex justify-between  text-left rounded-xl border border-rose-500  cursor-grab task
        opacity-60"
      >
        {task.content}
      </div>
    );

  if (editMode)
    return (
      <div
        className="bg-gray-800 p-2.5 h-[100px] min-h-[100px] items-center flex justify-between  text-left rounded-xl hover:ring-2 hover:ring-inset hover:ring-rose-500 cursor-grab"
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
      >
        <textarea
          className="h-[90%] w-full resize-none border-none rounded bg-transparent text-white focus:outline-none"
          value={task.content}
          autoFocus
          placeholder="Edit Task content"
          onBlur={toggleEditMode}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.shiftKey) toggleEditMode();
          }}
          onChange={(e) => updateTask(task.id, e.target.value)}
        />
      </div>
    );

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={toggleEditMode}
      className="bg-gray-800 p-2.5 h-[100px] min-h-[100px] items-center flex justify-between  text-left rounded-xl hover:ring-2 hover:ring-inset hover:ring-rose-500 cursor-grab task"
      onMouseEnter={() => setMouseIsOver(true)}
      onMouseLeave={() => setMouseIsOver(true)}
    >
      <p className="my-auto h-[90%] w-full overflow-y-auto overflow-x-hidden whitespace-pre-wrap">
        {task.content}
      </p>

      {mouseIsOver && (
        <Button onClick={() => deleteTask(task.id)} size="icon">
          <Trash />
        </Button>
      )}
    </div>
  );
}
export default TaskCard;
