// contrast/automotive
import type { Component, JSX } from 'solid-js';

export const IconAirplane1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path fill="currentColor" d="M7 22c1.49-.298 4.52-.474 4.95-.497a1 1 0 0 1 .1 0c.43.023 3.46.2 4.95.497v-.532a1 1 0 0 0-.36-.768L14 18.5l.5-3.5 7.5 2v-.5a3 3 0 0 0-1.2-2.4L14 9V4c0-1.105-1.5-2-2-2s-2 .895-2 2v5l-6.8 5.1A3 3 0 0 0 2 16.5v.5l7.5-2 .5 3.5-2.64 2.2a1 1 0 0 0-.36.768z" opacity=".28"/><path stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 22c1.48-.296 4.48-.498 4.94-.528a1 1 0 0 1 .12 0c.46.03 3.46.232 4.94.528v-.532a1 1 0 0 0-.36-.768L14 18.5l.5-3.5 7.5 2v-.5a3 3 0 0 0-1.2-2.4L14 9V4c0-1.105-1.5-2-2-2s-2 .895-2 2v5l-6.8 5.1A3 3 0 0 0 2 16.5v.5l7.5-2 .5 3.5-2.64 2.2a1 1 0 0 0-.36.768z"/>
    </svg>
  );
};

export default IconAirplane1;
