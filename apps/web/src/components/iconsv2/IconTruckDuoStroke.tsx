// duo-stroke/automotive
import type { Component, JSX } from 'solid-js';

export const IconTruckDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.8 5.5H5.2c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874C2 7.02 2 7.58 2 8.7v6.6c0 1.12 0 1.68.218 2.108a2 2 0 0 0 .874.874c.564.287 1.298.216 1.908.218a2 2 0 1 1 4 0h6v-10c0-.988-.013-1.506-.218-1.908a2 2 0 0 0-.874-.874C13.48 5.5 12.92 5.5 11.8 5.5Z" opacity=".28" fill="none"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 18.5v-10h2.834c.782 0 1.173 0 1.511.126a2 2 0 0 1 .781.529c.243.267.388.63.679 1.357L22 13.5v1.8c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874c-.564.287-1.298.216-1.908.218m-4 0a2 2 0 1 0 4 0m-4 0a2 2 0 1 1 4 0m-4 0H9m0 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" fill="none"/>
    </svg>
  );
};

export default IconTruckDuoStroke;
