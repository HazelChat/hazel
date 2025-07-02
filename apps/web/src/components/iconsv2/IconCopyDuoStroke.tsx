// duo-stroke/general
import type { Component, JSX } from 'solid-js';

export const IconCopyDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16.902 16.902a4 4 0 0 0 .643-.147 5 5 0 0 0 3.21-3.21C21 12.792 21 11.861 21 10s0-2.792-.245-3.545a5 5 0 0 0-3.21-3.21C16.792 3 15.861 3 14 3s-2.792 0-3.545.245a5 5 0 0 0-3.21 3.21 4 4 0 0 0-.147.643" opacity=".28" fill="none"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 14c0-1.861 0-2.792.245-3.545a5 5 0 0 1 3.21-3.21C7.208 7 8.139 7 10 7s2.792 0 3.545.245a5 5 0 0 1 3.21 3.21C17 11.208 17 12.139 17 14s0 2.792-.245 3.545a5 5 0 0 1-3.21 3.21C12.792 21 11.861 21 10 21s-2.792 0-3.545-.245a5 5 0 0 1-3.21-3.21C3 16.792 3 15.861 3 14Z" fill="none"/>
    </svg>
  );
};

export default IconCopyDuoStroke;
