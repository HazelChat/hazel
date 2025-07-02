// duo-stroke/files-&-folders
import type { Component, JSX } from 'solid-js';

export const IconFileDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.6 22h-3.2c-2.24 0-3.36 0-4.216-.436a4 4 0 0 1-1.748-1.748C4 18.96 4 17.84 4 15.6V8.4c0-2.24 0-3.36.436-4.216a4 4 0 0 1 1.748-1.748C7.04 2 8.16 2 10.4 2h1.949c.978 0 1.468 0 1.928.11.408.099.798.26 1.156.48.404.247.75.593 1.442 1.285l1.25 1.25c.692.692 1.038 1.038 1.286 1.442a4 4 0 0 1 .479 1.156c.11.46.11.95.11 1.928V15.6c0 2.24 0 3.36-.436 4.216a4 4 0 0 1-1.748 1.748C16.96 22 15.84 22 13.6 22Z" opacity=".28" fill="none"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m16.875 3.875 1.25 1.25c.692.692 1.038 1.038 1.286 1.442a4 4 0 0 1 .479 1.156q.031.134.052.277H18.8c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.31C14 5.72 14 4.88 14 3.2V2.058q.143.02.277.053c.408.098.798.26 1.156.479.404.247.75.593 1.442 1.285Z" fill="none"/>
    </svg>
  );
};

export default IconFileDuoStroke;
