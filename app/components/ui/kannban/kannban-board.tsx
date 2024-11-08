import { Plus } from "lucide-react";
import { Button } from "../button";
import { useState } from "react";
import { createPortal } from "react-dom";
import { ColId, ColumnKannban, Task } from "./types";
import { KannbanColumnContainer } from "./kannban-colum-container";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";

function KannbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [columns, setColumns] = useState<ColumnKannban[]>([]);
  const columnsId = columns.map((col) => col.id);

  const [activeCol, setActiveCol] = useState<ColumnKannban | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  function createNewCol() {
    const columnToAdd: ColumnKannban = {
      id: crypto.randomUUID(),
      title: `Col ${columns.length + 1}`,
    };
    setColumns([...columns, columnToAdd]);
  }

  function deleteCol(id: ColId) {
    const filteredCol = columns.filter((col) => col.id !== id);
    console.log({ filteredCol });
    setColumns(filteredCol);
  }

  function updateCol(id: ColId, title: string) {
    const newColumns = columns.map((col) => {
      if (col.id !== id) return col;
      return { ...col, title };
    });

    setColumns(newColumns);
  }

  function createTask(columnId: ColId) {
    const newTask = {
      id: crypto.randomUUID(),
      columnId,
      content: `Task ${tasks.length + 1}`,
    };

    setTasks([...tasks, newTask]);
  }

  function deleteTask(taskId: ColId) {}

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "Column") {
      setActiveCol(event.active.data.current.column);
      return;
    }
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const activeColId = active.id;
    const overColId = over.id;

    if (activeCol === overColId) return;

    setColumns((columns) => {
      const activeColIndex = columns.findIndex((col) => col.id === activeColId);
      const overColIndex = columns.findIndex((col) => col.id === overColId);

      return arrayMove(columns, activeColIndex, overColIndex);
    });
  }
  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="m-auto flex min-h-screen w-full items-center overflow-x-auto overflow-y-auto px-[40px]">
        <div className=" m-auto flex gap-4">
          <div className=" flex gap-4">
            <SortableContext items={columnsId}>
              {columns.map((col) => (
                <KannbanColumnContainer
                  updateCol={updateCol}
                  key={col.id}
                  deleteCol={deleteCol}
                  column={col}
                  createTask={createTask}
                  tasks={tasks.filter((task) => task.columnId === col.id)}
                  deleteTask={deleteTask}
                />
              ))}
            </SortableContext>
          </div>
        </div>

        <div className="m-auto ">
          <Button onClick={createNewCol}>
            <Plus />
            Add Column
          </Button>
        </div>
      </div>

      {typeof window !== "undefined" &&
        createPortal(
          <DragOverlay>
            {activeCol && (
              <KannbanColumnContainer
                updateCol={updateCol}
                deleteCol={deleteCol}
                column={activeCol}
                createTask={createTask}
                tasks={tasks.filter((task) => task.columnId === activeCol.id)}
                deleteTask={deleteTask}
              />
            )}
          </DragOverlay>,
          document.body
        )}
    </DndContext>
  );
}
export default KannbanBoard;
