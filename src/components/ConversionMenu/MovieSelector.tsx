import { useState } from "react";

import styles from "./MovieSelector.module.css";

type MovieSelectorProps = {
  handleSelect: (value: string) => void;
};

export default function MovieSelector({handleSelect}: MovieSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.popover}>
      <button onClick={() => setIsOpen((open) => !open)}>
        選択する
      </button>

      {isOpen && (
        <div className={styles.popoverContent}>
          <button onClick={() => handleSelect("A")}>
            選択肢A
          </button>
          <button onClick={() => handleSelect("B")}>
            選択肢B
          </button>
          <button onClick={() => handleSelect("C")}>
            選択肢C
          </button>
        </div>
      )}
    </div>
  );
}