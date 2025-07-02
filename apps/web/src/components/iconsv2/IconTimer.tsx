// solid/time
import type { Component, JSX } from 'solid-js';

export const IconTimer: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path fill-rule="evenodd" d="M10 1a1 1 0 0 0 0 2h1v2.055A9.001 9.001 0 0 0 12 23a9 9 0 0 0 1-17.945V3h1a1 1 0 1 0 0-2zm5.359 10.806a1 1 0 0 0-1.414-1.415l-2.829 2.829a1 1 0 0 0 1.414 1.414z" clip-rule="evenodd" fill="currentColor"/><path d="M18.66 4.615a1 1 0 0 1 1.413 0l1.061 1.06A1 1 0 0 1 19.72 7.09l-1.06-1.061a1 1 0 0 1 0-1.414Z" fill="currentColor"/>
    </svg>
  );
};

export default IconTimer;
