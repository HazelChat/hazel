// duo-solid/files-&-folders
import type { Component, JSX } from 'solid-js';

export const IconBookmarkDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path fill="currentColor" d="M11.8 1c-1.668 0-2.748 0-3.654.294a6 6 0 0 0-3.852 3.852C3.999 6.052 4 7.132 4 8.8V22a1 1 0 0 0 1.65.76l1.795-1.538c.935-.802 1.595-1.367 2.148-1.773.544-.398.927-.599 1.288-.704a4 4 0 0 1 2.238 0c.361.105.744.306 1.288.704.553.406 1.213.971 2.149 1.773l1.793 1.537A1 1 0 0 0 20 22V8.8c0-1.669 0-2.748-.294-3.654a6 6 0 0 0-3.852-3.852C14.948.999 13.87 1 12.2 1z" opacity=".28"/><path stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 22-1.794-1.537c-1.848-1.584-2.771-2.376-3.808-2.678a5 5 0 0 0-2.796 0c-1.037.302-1.96 1.094-3.808 2.678L5 22"/>
    </svg>
  );
};

export default IconBookmarkDuoSolid;
