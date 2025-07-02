// solid/general
import type { Component, JSX } from 'solid-js';

export const IconSearchZoomOut: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M2 10a8 8 0 1 1 14.32 4.906l5.387 5.387a1 1 0 0 1-1.414 1.414l-5.387-5.387A8 8 0 0 1 2 10Zm5.001-1a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2z" fill="currentColor"/>
    </svg>
  );
};

export default IconSearchZoomOut;
