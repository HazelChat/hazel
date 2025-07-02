// duo-solid/devices
import type { Component, JSX } from 'solid-js';

export const IconVideoCallDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.714 15.4A2 2 0 0 1 17 13.933v-3.875a2 2 0 0 1 .712-1.458l1-.84C20.016 6.668 22 7.593 22 9.29v5.417c0 1.7-1.985 2.624-3.286 1.531z" opacity=".28"/><path fill="currentColor" d="M6 4a5 5 0 0 0-5 5v6a5 5 0 0 0 5 5h7a5 5 0 0 0 5-5V9a5 5 0 0 0-5-5z"/>
    </svg>
  );
};

export default IconVideoCallDuoSolid;
