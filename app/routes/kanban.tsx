import { useState } from "react";

import DragAndDrop from "~/components/ui/kanban/DragAndDrop";
import Popup from "~/components/ui/kanban/PopupKannban";
import { Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { KannbanColumns } from "~/components/ui/kanban/types";

export const tasksInitial = [
  { id: "i1", title: "Task 1", date: "Oct 22, 2024, 13:53PM" },
  { id: "i2", title: "Task 2", date: "Oct 22, 2024, 13:53PM" },
];

export const columnsData: KannbanColumns = {
  todo: {
    name: "To Do",
    items: tasksInitial,
  },
  inprogress: {
    name: "In Progress",
    items: [],
  },
  finished: {
    name: "Finished",
    items: [],
  },
  undefined: {
    name: "Undefined",
    items: [],
  },
};

const Kanban = () => {
  const [columns, setColumns] = useState(columnsData);
  const [isPopupShown, setIsPopupShown] = useState(false);
  const [inputField, setInputField] = useState("");

  console.log(columns);
  const [taskToEditState, setTaskToEditState] = useState({
    task: {},
    isEditting: false,
    column: "",
  });

  const [isBtnHovered, setBtnIsHovered] = useState(false);

  function handleMouseEnter() {
    setBtnIsHovered(true);
  }

  function handleMouseLeave() {
    setBtnIsHovered(false);
  }

  const showPopupHandler = (event: any) => {
    setIsPopupShown(true);
  };

  const insertNewTaskHandler = (newTask: any) => {
    setColumns((prevState) => ({
      ...prevState,
      todo: {
        name: prevState.todo.name,
        items: [...prevState.todo.items, newTask],
      },
    }));
  };

  return (
    <>
      {isPopupShown && (
        <Popup
          inputField={inputField}
          setInputField={setInputField}
          columns={columns}
          setColumns={setColumns}
          onTasks={insertNewTaskHandler}
          setIsPopupShown={setIsPopupShown}
          taskToEditState={taskToEditState}
          setTaskToEditState={setTaskToEditState}
        />
      )}

      <Card>
        <div className="p-1 flex justify-between items-center border border-gray-700">
          <h2 className="font-medium text-lg text-white">Tasks</h2>
          <Button
            size="lg"
            onClick={showPopupHandler}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <Plus />
            New Task
          </Button>
        </div>
        <DragAndDrop
          inputField={inputField}
          setInputField={setInputField}
          setIsPopupShown={setIsPopupShown}
          columns={columns}
          setColumns={setColumns}
          setTaskToEditState={setTaskToEditState}
        />
      </Card>
    </>
  );
};

export default Kanban;
