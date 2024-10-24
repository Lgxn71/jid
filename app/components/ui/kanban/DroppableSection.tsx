import { FC, ReactNode } from "react";

interface DroppableSectionProps {
  droppableProps: any;
  innerRef: any;
  isDraggingOver: boolean;
  providedPlacholder: any;
  children: ReactNode;
}

const DroppableSection: FC<DroppableSectionProps> = ({
  droppableProps,
  innerRef,
  isDraggingOver,
  providedPlacholder,
  children,
}) => {
  return (
    <div
      ref={innerRef}
      {...droppableProps}
      className={`grid content-start h-[95%] rounded-xl max-w-[400px] w-full min-h-[734px] mx-auto mb-5
      ${
        isDraggingOver
          ? "bg-[#2c2f38] border border-gray-700"
          : "bg-[#15161a] border border-gray-700"
      }`}
    >
      {children}
      {providedPlacholder}
    </div>
  );
};
export default DroppableSection;
