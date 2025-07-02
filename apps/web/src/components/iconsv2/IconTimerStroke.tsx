// stroke/time
import type { Component, JSX } from 'solid-js';

export const IconTimerStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2v4m0 0a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm-2-4h4m5.366 3.322 1.06 1.06M14.639 11.1l-2.829 2.83m2.842-2.83-2.829 2.828" fill="none"/>
    </svg>
  );
};

export default IconTimerStroke;
