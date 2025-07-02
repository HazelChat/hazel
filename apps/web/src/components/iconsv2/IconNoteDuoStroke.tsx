// duo-stroke/editing
import type { Component, JSX } from 'solid-js';

export const IconNoteDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 7.8v7.4c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.31C18.72 20 17.88 20 16.2 20H7.8c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.311C3 17.72 3 16.88 3 15.2V7.8" opacity=".28" fill="none"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12.666h10M7 18h7m2.2-16H7.8c-1.68 0-2.52 0-3.162.436-.564.384-1.023.996-1.311 1.748-.27.708-.317 1.596-.325 3.149h17.996c-.008-1.553-.055-2.441-.325-3.149-.288-.752-.746-1.364-1.311-1.748C18.72 2 17.88 2 16.2 2Z" fill="none"/>
    </svg>
  );
};

export default IconNoteDuoStroke;
