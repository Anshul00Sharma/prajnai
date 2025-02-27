import React, { ReactNode } from "react";

interface AddBlockButtonProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}

const AddBlockButton: React.FC<AddBlockButtonProps> = ({
  icon,
  label,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-start w-36 h-36 border-2 border-theme-primary rounded-2xl hover:bg-theme-primary/5 transition-colors"
    >
      <div className="h-8 w-[90%] mt-2 mb-2 border-2 border-theme-primary rounded-xl"></div>
      <div className="h-[60%] w-[90%]  mb-2 border-2 border-theme-primary rounded-xl flex flex-col items-center justify-center">
        <div className="text-theme-primary ">{icon}</div>
        <span className="text-sm font-medium text-theme-primary">{label}</span>
      </div>
    </button>
  );
};

export default AddBlockButton;
