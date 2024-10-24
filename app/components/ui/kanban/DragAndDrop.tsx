import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { onDragEnd } from "./DragEnd";
import DroppableSection from "./DroppableSection";
import DraggableSection from "./DraggableSection";
import { FC } from "react";
import { KannbanColumns } from "./types";

interface IKannban {
  inputField: string;
  setInputField: React.Dispatch<React.SetStateAction<string>>;
  setIsPopupShown: React.Dispatch<React.SetStateAction<boolean>>;
  columns: KannbanColumns;
  setColumns: React.Dispatch<React.SetStateAction<KannbanColumns>>;
  setTaskToEditState: React.Dispatch<
    React.SetStateAction<{
      task: {};
      isEditting: boolean;
      column: string;
    }>
  >;
}
const Kannban: FC<IKannban> = (props) => {
  const {
    columns,
    setColumns,
    setInputField,
    inputField,
    setIsPopupShown,
    setTaskToEditState,
  } = props;

  return (
    <div className="grid grid-cols-4 gap-5 px-5">
      <DragDropContext
        onDragEnd={(result) => onDragEnd(result, columns, setColumns)}
      >
        {Object.entries(columns).map(([id, column]) => {
          const counter = column.items.length;
          const columnName = column.name;

          return (
            <div className="grid" key={id}>
              <h3 className="font-medium text-sm leading-5 my-5 text-gray-200">
                {columnName}
                <span className="inline-block rounded w-5 h-5 text-center ml-1 bg-gray-700">
                  {counter}
                </span>
              </h3>
              <Droppable droppableId={id}>
                {(provided, snapshot) => {
                  return (
                    <DroppableSection
                      isDraggingOver={snapshot.isDraggingOver}
                      droppableProps={provided.droppableProps}
                      innerRef={provided.innerRef}
                      providedPlacholder={provided.placeholder}
                    >
                      {column.items.map((item: any, index: number) => {
                        const taskContent = {
                          itemTitle: item.title,
                          date: item.date,
                        };

                        return (
                          <Draggable
                            key={item.id}
                            draggableId={item.id}
                            index={index}
                          >
                            {(provided, snapshot) => {
                              return (
                                <DraggableSection
                                  inputField={inputField}
                                  setInputField={setInputField}
                                  taskContent={taskContent}
                                  setIsPopupShown={setIsPopupShown}
                                  setTaskToEditState={setTaskToEditState}
                                  id={item.id}
                                  column={column}
                                  setColumns={setColumns}
                                  innerRef={provided.innerRef}
                                  isDraggingOver={snapshot.draggingOver}
                                  draggableProps={provided.draggableProps}
                                  dragHandleProps={provided.dragHandleProps}
                                />
                              );
                            }}
                          </Draggable>
                        );
                      })}
                    </DroppableSection>
                  );
                }}
              </Droppable>
            </div>
          );
        })}
      </DragDropContext>
    </div>
  );
};

export default Kannban;
