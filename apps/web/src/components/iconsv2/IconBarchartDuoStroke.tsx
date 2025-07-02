// duo-stroke/chart-&-graph
import type { Component, JSX } from 'solid-js';

export const IconBarchartDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <g stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" opacity=".28"><path d="M15 11c0-.932 0-1.398.152-1.765a2 2 0 0 1 1.083-1.083C16.602 8 17.068 8 18 8s1.398 0 1.765.152a2 2 0 0 1 1.083 1.083C21 9.602 21 10.068 21 11v6.8c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C19.48 21 18.92 21 17.8 21H15z" fill="none"/><path d="M3 15c0-.932 0-1.398.152-1.765a2 2 0 0 1 1.083-1.083C4.602 12 5.068 12 6 12s1.398 0 1.765.152a2 2 0 0 1 1.083 1.083C9 13.602 9 14.068 9 15v6H6.2c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874C3 19.48 3 18.92 3 17.8z" fill="none"/></g><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 6c0-.932 0-1.398.152-1.765a2 2 0 0 1 1.083-1.083C10.602 3 11.068 3 12 3s1.398 0 1.765.152a2 2 0 0 1 1.083 1.083C15 4.602 15 5.068 15 6v15H9z" fill="none"/>
    </svg>
  );
};

export default IconBarchartDuoStroke;
