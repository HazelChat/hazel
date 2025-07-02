// duo-stroke/weather
import type { Component, JSX } from 'solid-js';

export const IconCloudDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6.017 11.026a6.5 6.5 0 0 1 12.651-1.582A5.501 5.501 0 0 1 16.5 20h-10a4.5 4.5 0 0 1-.483-8.974Zm0 0A6.6 6.6 0 0 0 6.174 13" opacity=".28" fill="none"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16.5 20a5.5 5.5 0 0 0 2.168-10.556A6.5 6.5 0 0 0 6.174 13" fill="none"/>
    </svg>
  );
};

export default IconCloudDuoStroke;
