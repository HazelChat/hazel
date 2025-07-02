// duo-stroke/general
import type { Component, JSX } from 'solid-js';

export const IconGiftDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 11.997V16.2c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.311C17.72 21 16.88 21 15.2 21H12m-8-9.003V16.2c0 1.68 0 2.52.327 3.162a3 3 0 0 0 1.311 1.311C6.28 21 7.12 21 8.8 21H12m0 0V7" opacity=".28" fill="none"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.5 7A2.5 2.5 0 1 0 12 4.5M14.5 7H12m2.5 0h5c.465 0 .697 0 .89.038a2 2 0 0 1 1.572 1.572c.038.193.038.425.038.89s0 .697-.038.89a2 2 0 0 1-1.572 1.572c-.107.02-.226.03-.39.035-.132.003-.293.003-.5.003h-15c-.207 0-.368 0-.5-.003a2.3 2.3 0 0 1-.39-.035 2 2 0 0 1-1.572-1.572C2 10.197 2 9.965 2 9.5s0-.697.038-.89A2 2 0 0 1 3.61 7.038C3.803 7 4.035 7 4.5 7h5M12 4.5A2.5 2.5 0 1 0 9.5 7M12 4.5V7M9.5 7H12" fill="none"/>
    </svg>
  );
};

export default IconGiftDuoStroke;
