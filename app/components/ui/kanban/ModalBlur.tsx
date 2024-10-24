import { createPortal } from "react-dom";

const ModalBlur = (props: any) => {
  const { closePopUpHandler } = props;

  return (
    <>
      {createPortal(
        <div
          onClick={closePopUpHandler}
          className="fixed inset-0 w-full h-full bg-black bg-opacity-20 backdrop-blur-[2.5px] z-20"
        ></div>,
        document.getElementById("modal-background")
      )}
    </>
  );
};
export default ModalBlur;
