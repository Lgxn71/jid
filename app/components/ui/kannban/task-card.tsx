import { Trash } from "lucide-react";
import { Button } from "../button";
import { ColId, Task } from "./types";
import { useState } from "react";

interface Props {
  task: Task;
  deleteTask: (id: ColId) => void;
}
function TaskCard({ task, deleteTask }: Props) {
  const [mouseIsOver, setMouseIsOver] = useState(false);

  return (
    <div
      className="bg-gray-800 p-2.5 h-[100px] min-h-[100px] items-center flex justify-between  text-left rounded-xl hover:ring-2 hover:ring-inset hover:ring-rose-500 cursor-grab"
      onMouseEnter={() => setMouseIsOver(true)}
      onMouseLeave={() => setMouseIsOver(true)}
    >
      {task.content}

      {mouseIsOver && (
        <Button onClick={() => deleteTask(task.id)} size="icon">
          <Trash />
        </Button>
      )}
    </div>
  );
}
export default TaskCard;
