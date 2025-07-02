// contrast/time
import type { Component, JSX } from 'solid-js';

export const IconTimer1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path fill="currentColor" d="M20 14a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" opacity=".28"/><path stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2v4m0 0a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm-2-4h4m5.366 3.322 1.06 1.06m-5.774 4.716-2.829 2.829"/>
    </svg>
  );
};

export default IconTimer1;
