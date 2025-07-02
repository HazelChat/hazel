// solid/time
import type { Component, JSX } from 'solid-js';

export const IconAlarm: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M5.707 2.293a1 1 0 0 1 0 1.414l-3 3a1 1 0 0 1-1.414-1.414l3-3a1 1 0 0 1 1.414 0Z" fill="currentColor"/><path d="M18.293 2.293a1 1 0 0 1 1.414 0l3 3a1 1 0 0 1-1.414 1.414l-3-3a1 1 0 0 1 0-1.414Z" fill="currentColor"/><path fill-rule="evenodd" d="M3 13a9 9 0 1 1 18 0 9 9 0 0 1-18 0Zm10-3.102a1 1 0 1 0-2 0v3.819a1.5 1.5 0 0 0 .728 1.286l2.315 1.393a1 1 0 1 0 1.031-1.714L13 13.434z" clip-rule="evenodd" fill="currentColor"/>
    </svg>
  );
};

export default IconAlarm;
