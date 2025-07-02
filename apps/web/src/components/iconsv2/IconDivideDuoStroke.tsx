// duo-stroke/maths
import type { Component, JSX } from 'solid-js';

export const IconDivideDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <g stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" opacity=".28"><path d="M13.002 17.002a1.001 1.001 0 1 1-2.003 0 1.001 1.001 0 0 1 2.002 0Z" fill="none"/><path d="M13.002 6.999a1.001 1.001 0 1 1-2.003 0 1.001 1.001 0 0 1 2.002 0Z" fill="none"/></g><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14" fill="none"/>
    </svg>
  );
};

export default IconDivideDuoStroke;
