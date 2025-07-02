// duo-solid/general
import type { Component, JSX } from 'solid-js';

export const IconSidebarDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20.989C9.577 21 10.236 21 11 21h2c2.8 0 4.2 0 5.27-.545a5 5 0 0 0 2.185-2.185C21 17.2 21 15.8 21 13v-2c0-2.8 0-4.2-.545-5.27a5 5 0 0 0-2.185-2.185C17.2 3 15.8 3 13 3h-2c-.764 0-1.423 0-2 .011" opacity=".28"/><path fill="currentColor" d="M10 3.01a1 1 0 0 0-1.02-1c-1.534.03-2.7.132-3.704.644a6 6 0 0 0-2.622 2.622c-.356.699-.51 1.463-.583 2.358C2 8.51 2 9.593 2 10.956v2.088c0 1.362 0 2.447.071 3.321.074.896.227 1.66.583 2.359a6 6 0 0 0 2.622 2.622c1.004.511 2.17.613 3.705.642a1 1 0 0 0 1.019-1z"/>
    </svg>
  );
};

export default IconSidebarDuoSolid;
