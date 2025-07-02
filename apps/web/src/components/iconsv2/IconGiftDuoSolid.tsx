// duo-solid/general
import type { Component, JSX } from 'solid-js';

export const IconGiftDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <g fill="currentColor" opacity=".28"><path fill="currentColor"  d="M11 14H4a1 1 0 0 0-1 1v2.241c0 .805 0 1.47.044 2.01.046.563.145 1.08.392 1.565a4 4 0 0 0 1.748 1.748c.485.247 1.002.346 1.564.392C7.29 23 7.954 23 8.758 23H11z"/><path fill="currentColor"  d="M13 23v-9h7a1 1 0 0 1 1 1v2.241c0 .805 0 1.47-.044 2.01-.046.563-.145 1.08-.392 1.565a4 4 0 0 1-1.748 1.748c-.485.247-1.002.346-1.564.392-.541.044-1.206.044-2.01.044z"/></g><path fill="currentColor" d="M6 5.5a3.5 3.5 0 0 1 6-2.45A3.5 3.5 0 0 1 17.663 7H20.5a2.5 2.5 0 0 1 0 5H13V7h1.5A1.5 1.5 0 1 0 13 5.5V7h-2V5.5A1.5 1.5 0 1 0 9.5 7H11v5H3.5a2.5 2.5 0 0 1 0-5h2.837A3.5 3.5 0 0 1 6 5.5Z"/>
    </svg>
  );
};

export default IconGiftDuoSolid;
