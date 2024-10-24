import { FC, useState } from "react";
import { MoreHorizontal } from "lucide-react"; // Importing icon from lucide-react
import { KannbanColumns } from "./types";
import {
  DraggableProvidedDraggableProps,
  DraggableProvidedDragHandleProps,
} from "react-beautiful-dnd";

interface DraggableProps {
  inputField: string;
  setInputField: React.Dispatch<React.SetStateAction<string>>;
  taskContent: {
    itemTitle: any;
    date: any;
  };
  setTaskToEditState: React.Dispatch<
    React.SetStateAction<{
      task: {};
      isEditting: boolean;
      column: string;
    }>
  >;
  id: any;
  column: any;
  setColumns: React.Dispatch<React.SetStateAction<KannbanColumns>>;
  innerRef: (element: HTMLElement | null) => void;
  isDraggingOver: string | null | undefined;
  draggableProps: DraggableProvidedDraggableProps;
  dragHandleProps: DraggableProvidedDragHandleProps | null | undefined;
  setIsPopupShown: React.Dispatch<React.SetStateAction<boolean>>;
}

const DraggableSection: FC<DraggableProps> = ({
  setColumns,
  id,
  column,
  setIsPopupShown,
  setTaskToEditState,
  setInputField,
  innerRef,
  isDraggingOver,
  draggableProps,
  dragHandleProps,
  taskContent,
}) => {
  const [isDropDownShown, setIsDropDownShown] = useState(false);

  const deleteTaskHandler = () => {
    const result = column.items.filter((task: any) => task.id !== id);

    if (column.name === "To Do") {
      setColumns((prevState) => ({
        ...prevState,
        todo: { name: prevState.todo.name, items: result },
      }));
    }

    if (column.name === "In Progress") {
      setColumns((prevState) => ({
        ...prevState,
        inprogress: { name: prevState.inprogress.name, items: result },
      }));
    }

    if (column.name === "Finished") {
      setColumns((prevState) => ({
        ...prevState,
        finished: { name: prevState.finished.name, items: result },
      }));
    }

    if (column.name === "Undefined") {
      setColumns((prevState) => ({
        ...prevState,
        undefined: { name: prevState.undefined.name, items: result },
      }));
    }
  };

  const editTaskHandler = (event: any) => {
    const taskID = event.target.dataset.id;
    const taskToEdit = column.items.find((item: any) => taskID === item.id);
    setInputField(taskToEdit.title);
    setTaskToEditState({
      task: {
        id: taskToEdit.id,
        title: taskToEdit.title,
        date: taskToEdit.date,
      },
      isEditting: true,
      column: column.name,
    });
    setIsPopupShown(true);
    setIsDropDownShown((prevState) => !prevState);
  };

  const showDropDownHandler = () => {
    setIsDropDownShown((prevState) => !prevState);
  };

  return (
    <>
      <div
        {...dragHandleProps}
        {...draggableProps}
        ref={innerRef}
        className={`user-select-none m-1.5 ml-0.75 w-[97%] rounded-lg max-w-[400px] h-[100px] ${
          isDraggingOver
            ? "bg-[#30333a] border border-gray-700"
            : "bg-[#1f2126] border border-gray-700"
        }`}
      >
        <div className="flex items-center justify-between relative p-4 border-b border-gray-700">
          <h3 className="font-medium text-white text-sm leading-7">
            {taskContent.itemTitle}
          </h3>
          {isDropDownShown && (
            <div className="absolute z-10 top-12 left-36 w-[150px] max-h-[90px] bg-[#1f2126] border border-gray-700 rounded-lg">
              <p
                className="text-sm text-gray-400 px-4 py-2 hover:bg-gray-100 hover:text-black cursor-pointer"
                data-id={id}
                onClick={editTaskHandler}
              >
                Edit
              </p>
              <hr className="border-gray-700" />
              <p
                className="text-sm text-gray-400 px-4 py-2 hover:bg-gray-100 hover:text-black cursor-pointer"
                onClick={deleteTaskHandler}
              >
                Delete
              </p>
            </div>
          )}
          <MoreHorizontal
            className="cursor-pointer text-white"
            onClick={showDropDownHandler}
          />
        </div>
        <p className="mx-4 my-2 text-gray-500 text-xs leading-5">
          {taskContent.date}
        </p>
      </div>
    </>
  );
};

export default DraggableSection;
