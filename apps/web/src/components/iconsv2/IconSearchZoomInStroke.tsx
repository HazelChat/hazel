// stroke/general
import type { Component, JSX } from 'solid-js';

export const IconSearchZoomInStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-6.05-6.05m0 0a7 7 0 1 0-9.9-9.9 7 7 0 0 0 9.9 9.9ZM10 13v-3m0 0V7m0 3H7m3 0h3" fill="none"/>
    </svg>
  );
};

export default IconSearchZoomInStroke;
