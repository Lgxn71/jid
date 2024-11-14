import { Plus } from "lucide-react";
import { Button } from "../button";
import { useState } from "react";
import { createPortal } from "react-dom";
import { ColId, ColumnKannban, Task } from "./types";
import { KannbanColumnContainer } from "./kannban-colum-container";

import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import TaskCard from "./task-card";

function KannbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [columns, setColumns] = useState<ColumnKannban[]>([]);
  const columnsId = columns.map((col) => col.id);

  const [activeCol, setActiveCol] = useState<ColumnKannban | null>(null);

  const [activeTask, setActiveTask] = useState<Task | null>(null);

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
    setColumns(filteredCol);

    const newTasks = tasks.filter((t) => t.columnId !== id);
    setTasks(newTasks);
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
  function updateTask(id: ColId, content: string) {
    const newTask = tasks.map((task) => {
      if (task.id !== id) return task;
      return { ...task, content };
    });

    setTasks(newTask);
  }

  function deleteTask(taskId: ColId) {
    const newTasks = tasks.filter((task) => task.id !== taskId);
    setTasks(newTasks);
  }

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "Column") {
      setActiveCol(event.active.data.current.column);
      return;
    }

    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
      return;
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveCol(null);
    setActiveTask(null);
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

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    const activeColId = active.id;
    const overColId = over.id;

    if (activeCol === overColId) return;

    if (!activeTask) return;

    const isActiveTask = active.data.current?.type === "Task";
    const isOverTask = over.data.current?.type === "Task";
    // drop tak over another task
    if (isActiveTask && isOverTask)
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeColId);
        const overIndex = tasks.findIndex((t) => t.id === overColId);

        if (tasks[activeIndex] && tasks[overIndex])
          tasks[activeIndex].columnId = tasks[overIndex].columnId;

        return arrayMove(tasks, activeIndex, overIndex);
      });

    // drop task over a col

    const isOverColumn = over.data.current?.type === "Column";
    if (isActiveTask && isOverColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeColId);

        if (tasks[activeIndex] && overColId)
          tasks[activeIndex].columnId = overColId;

        return arrayMove(tasks, activeIndex, activeIndex);
      });
    }
  }
  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
    >
      <div className="mx-auto flex gap-4 min-h-full w-full items-center overflow-x-auto overflow-y-auto ">
        <div className=" mx-auto flex gap-4">
          <div className=" flex gap-4">
            <SortableContext items={columnsId}>
              {columns.map((col) => (
                <KannbanColumnContainer
                  updateTask={updateTask}
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

        <div className="mx-auto ">
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
                updateTask={updateTask}
                updateCol={updateCol}
                deleteCol={deleteCol}
                column={activeCol}
                createTask={createTask}
                tasks={tasks.filter((task) => task.columnId === activeCol.id)}
                deleteTask={deleteTask}
              />
            )}
            {activeTask && (
              <TaskCard
                task={activeTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
              />
            )}
          </DragOverlay>,
          document.body
        )}
    </DndContext>
  );
}
export default KannbanBoard;
