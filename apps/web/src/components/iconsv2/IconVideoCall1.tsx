// contrast/devices
import type { Component, JSX } from 'solid-js';

export const IconVideoCall1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path fill="currentColor" d="M13 19a4 4 0 0 0 4-4V9a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v6a4 4 0 0 0 4 4z" opacity=".28"/><path stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.001 13.934a2 2 0 0 0 .713 1.465l1 .84c1.3 1.093 3.286.168 3.286-1.531V9.292c0-1.7-1.985-2.624-3.286-1.531l-1 .84A2 2 0 0 0 17 10.059m0 3.875V15a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V9a4 4 0 0 1 4-4h7a4 4 0 0 1 4 4l.001 1.059m0 3.875v-3.875"/>
    </svg>
  );
};

export default IconVideoCall1;
