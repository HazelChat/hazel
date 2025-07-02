// stroke/general
import type { Component, JSX } from 'solid-js';

export const IconFloppyStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 7H7m10 14v-3.2c0-1.68 0-2.52-.327-3.162a3 3 0 0 0-1.311-1.311C14.72 13 13.88 13 12.2 13h-.4c-1.68 0-2.52 0-3.162.327a3 3 0 0 0-1.311 1.311C7 15.28 7 16.12 7 17.8V21m10 0H7m10 0a4 4 0 0 0 4-4V9.053c0-1.018-.217-1.542-.937-2.262l-2.854-2.854C16.49 3.217 15.966 3 14.947 3H9.4c-2.24 0-3.36 0-4.216.436a4 4 0 0 0-1.748 1.748C3 6.04 3 7.16 3 9.4V17a4 4 0 0 0 4 4" fill="none"/>
    </svg>
  );
};

export default IconFloppyStroke;
