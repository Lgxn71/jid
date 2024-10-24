import { v4 as uuidv4 } from "uuid";

import ModalBlur from "./ModalBlur";
import { Card } from "~/components/ui/card";
import { KannbanColumns } from "./types";
import { FC } from "react";

interface yaUstalSheshenAmi {
  inputField: string;
  setInputField: React.Dispatch<React.SetStateAction<string>>;
  columns: KannbanColumns;
  setColumns: React.Dispatch<React.SetStateAction<KannbanColumns>>;
  setIsPopupShown: React.Dispatch<React.SetStateAction<boolean>>;
  onTasks: (newTask: any) => void;
  taskToEditState: {
    task: {};
    isEditting: boolean;
    column: string;
  };
  setTaskToEditState: React.Dispatch<
    React.SetStateAction<{
      task: {};
      isEditting: boolean;
      column: string;
    }>
  >;
}

const Popup: FC<yaUstalSheshenAmi> = ({
  columns,
  setColumns,
  setIsPopupShown,
  inputField,
  setInputField,
  onTasks,
  taskToEditState,
  setTaskToEditState,
}) => {
  const inputFieldHandler = (event: any) => {
    setInputField(event.target.value);
    if (taskToEditState.isEditting) {
      setTaskToEditState((prevState) => ({
        ...prevState,
        task: {
          ...prevState.task,
          title: event.target.value,
        },
      }));
    }
  };

  const closePopUpHandler = () => {
    setIsPopupShown(false);
    setTaskToEditState({
      task: {},
      isEditting: false,
      column: "",
    });
    setInputField("");
  };

  const formEditHandler = (event: any) => {
    event.preventDefault();

    const filteredTasksTodo = columns.todo.items.filter(
      (item) => item.id !== taskToEditState.task.id
    );
    const filteredTasksInProgress = columns.inprogress.items.filter(
      (item) => item.id !== taskToEditState.task.id
    );
    const filteredTasksFinished = columns.finished.items.filter(
      (item) => item.id !== taskToEditState.task.id
    );
    const filteredTasksUndefined = columns.undefined.items.filter(
      (item) => item.id !== taskToEditState.task.id
    );

    if (taskToEditState.column === "To Do") {
      setColumns((prevState) => ({
        ...prevState,
        todo: {
          name: prevState.todo.name,
          items: [taskToEditState.task, ...filteredTasksTodo],
        },
      }));
    }
    if (taskToEditState.column === "In Progress") {
      setColumns((prevState) => ({
        ...prevState,
        inprogress: {
          name: prevState.inprogress.name,
          items: [taskToEditState.task, ...filteredTasksInProgress],
        },
      }));
    }
    if (taskToEditState.column === "Finished") {
      setColumns((prevState) => ({
        ...prevState,
        finished: {
          name: prevState.finished.name,
          items: [taskToEditState.task, ...filteredTasksFinished],
        },
      }));
    }

    if (taskToEditState.column === "Undefined") {
      setColumns((prevState) => ({
        ...prevState,
        undefined: {
          name: prevState.undefined.name,
          items: [taskToEditState.task, ...filteredTasksUndefined],
        },
      }));
    }

    setTaskToEditState({
      task: {},
      isEditting: false,
      column: "",
    });
    setIsPopupShown(false);
    setInputField("");
  };

  const formSubmitHandler = (event) => {
    event.preventDefault();

    const date = new Date();

    const options = {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };
    const formattedDate = date.toLocaleString("en-US", options);
    const taskId = uuidv4();
    const task = {
      id: taskId,
      title: inputField,
      date: formattedDate,
    };
    onTasks(task);

    setInputField("");
    setIsPopupShown(false);
  };

  return (
    <>
      <ModalBlur closePopUpHandler={closePopUpHandler} />
      <div className="fixed top-1/2 left-1/2 w-[510px] transform -translate-x-1/2 -translate-y-1/2 z-30 rounded-lg bg-[#15161a] border border-gray-700">
        <Card>
          <h2 className="font-medium text-base text-white p-5 border-b border-gray-700">
            {taskToEditState.isEditting ? "Edit Task" : "Add New Task"}
          </h2>

          <form
            onSubmit={
              taskToEditState.isEditting ? formEditHandler : formSubmitHandler
            }
          >
            <div className="px-5 py-4">
              <label
                className="block text-white font-medium pb-2"
                htmlFor="title"
              >
                Title
              </label>
              <input
                value={inputField}
                className="block w-full max-w-[430px] h-12 px-4 text-base font-normal bg-[#15161a] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                name="title"
                type="text"
                id="title"
                placeholder="Enter title for kanban"
                onChange={inputFieldHandler}
                required
              />
            </div>

            <div className="flex justify-between px-5 py-4 border-t border-gray-700">
              <button
                type="button"
                onClick={closePopUpHandler}
                className="font-medium text-base px-5 py-2.5 border border-gray-700 bg-[#1f2126] text-white rounded-md hover:bg-white hover:text-[#15161a]"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="font-medium text-base px-5 py-2.5 border border-white bg-white text-[#15161a] rounded-md hover:bg-[#0057ff] hover:text-white"
              >
                Add
              </button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
};

export default Popup;
