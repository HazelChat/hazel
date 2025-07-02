// solid/time
import type { Component, JSX } from 'solid-js';

export const IconClock: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path fill-rule="evenodd" d="M1.85 12C1.85 6.394 6.394 1.85 12 1.85c5.605 0 10.15 4.544 10.15 10.15S17.605 22.15 12 22.15 1.85 17.606 1.85 12ZM13 7.9a1 1 0 1 0-2 0v4.917c0 .512.261.99.694 1.265l2.812 1.79a1 1 0 1 0 1.074-1.688L13 12.542z" clip-rule="evenodd" fill="currentColor"/>
    </svg>
  );
};

export default IconClock;
