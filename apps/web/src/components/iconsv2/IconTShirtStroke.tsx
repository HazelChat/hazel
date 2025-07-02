// stroke/general
import type { Component, JSX } from 'solid-js';

export const IconTShirtStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1.5 6 8 3l1.09.272a12 12 0 0 0 5.82 0L16 3l6.5 3-1.5 5-3-1v10a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V10l-3 1z" fill="none"/>
    </svg>
  );
};

export default IconTShirtStroke;
