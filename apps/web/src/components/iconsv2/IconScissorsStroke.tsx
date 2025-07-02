// stroke/editing
import type { Component, JSX } from 'solid-js';

export const IconScissorsStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.4 3 12 11.4m0 0L3.6 3m8.4 8.4 3.454 3.454M12 11.399l-3.455 3.455m6.91 0a3.6 3.6 0 1 0 5.09 5.091 3.6 3.6 0 0 0-5.09-5.091Zm-6.91 0a3.6 3.6 0 1 0-5.091 5.09 3.6 3.6 0 0 0 5.091-5.09Z" fill="none"/>
    </svg>
  );
};

export default IconScissorsStroke;
