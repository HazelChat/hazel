// contrast/general
import type { Component, JSX } from 'solid-js';

export const IconFloppy1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path fill="currentColor" d="M17.188 3.916c-.33-.33-.496-.496-.698-.62a2 2 0 0 0-.576-.24c-.23-.055-.455-.055-.905-.056H9.56C8.485 3 7.662 3 7 3.046c-.752.052-1.295.163-1.761.4A4.1 4.1 0 0 0 3.447 5.24C3 6.116 3 7.264 3 9.56v4.88c0 2.296 0 3.444.447 4.321a4.1 4.1 0 0 0 1.792 1.792c.466.238 1.01.35 1.761.401C7.662 21 8.485 21 9.56 21h4.88c1.075 0 1.898 0 2.56-.046.752-.052 1.295-.163 1.761-.4a4.1 4.1 0 0 0 1.792-1.793C21 17.884 21 16.736 21 14.44V8.99c-.001-.45-.001-.674-.057-.904a2 2 0 0 0-.24-.576c-.123-.202-.288-.367-.62-.698z" opacity=".28"/><path stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 7H7m10 14v-3.2c0-1.68 0-2.52-.327-3.162a3 3 0 0 0-1.311-1.311C14.72 13 13.88 13 12.2 13h-.4c-1.68 0-2.52 0-3.162.327a3 3 0 0 0-1.311 1.311C7 15.28 7 16.12 7 17.8V21m10 0H7m10 0a4 4 0 0 0 4-4V9.053c0-1.018-.217-1.542-.937-2.262l-2.854-2.854C16.49 3.217 15.966 3 14.947 3H9.4c-2.24 0-3.36 0-4.216.436a4 4 0 0 0-1.748 1.748C3 6.04 3 7.16 3 9.4V17a4 4 0 0 0 4 4"/>
    </svg>
  );
};

export default IconFloppy1;
