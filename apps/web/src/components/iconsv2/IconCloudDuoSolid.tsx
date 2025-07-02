// duo-solid/weather
import type { Component, JSX } from 'solid-js';

export const IconCloudDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path fill="currentColor" d="M12.5 4a7.5 7.5 0 0 1 6.965 4.715A6.5 6.5 0 0 1 16.5 21h-10a5.5 5.5 0 0 1-1.383-10.824A7.5 7.5 0 0 1 7.434 5.97 7.47 7.47 0 0 1 12.5 4Z" opacity=".28"/><path stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16.5 20a5.5 5.5 0 0 0 2.168-10.556A6.5 6.5 0 0 0 6.174 13"/>
    </svg>
  );
};

export default IconCloudDuoSolid;
