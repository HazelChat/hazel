// contrast/weather
import type { Component, JSX } from 'solid-js';

export const IconCloud1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path fill="currentColor" d="M22 14.5a5.5 5.5 0 0 1-5.5 5.5h-10a4.5 4.5 0 0 1-.483-8.974 6.5 6.5 0 0 1 12.651-1.582A5.5 5.5 0 0 1 22 14.5Z" opacity=".28"/><path stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6.017 11.026a6.5 6.5 0 0 1 12.651-1.582A5.501 5.501 0 0 1 16.5 20h-10a4.5 4.5 0 0 1-.483-8.974Zm0 0A6.6 6.6 0 0 0 6.174 13"/>
    </svg>
  );
};

export default IconCloud1;
