// duo-stroke/communication
import type { Component, JSX } from 'solid-js';

export const IconInboxDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21.87 10.82c-.056-.146-.134-.283-.291-.558l-1.736-3.037c-.671-1.175-1.007-1.762-1.478-2.19a4 4 0 0 0-1.445-.838C16.315 4 15.64 4 14.286 4H9.714c-1.352 0-2.029 0-2.634.197a4 4 0 0 0-1.444.839c-.472.427-.807 1.014-1.478 2.189l-1.736 3.037c-.157.275-.236.412-.291.558" opacity=".28" fill="none"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20h4c2.8 0 4.2 0 5.27-.545a5 5 0 0 0 2.185-2.185C22 16.2 22 14.8 22 12v-.15c0-.317 0-.475-.024-.63a2 2 0 0 0-.048-.22h-5.005a.923.923 0 0 0-.923.923c0 1.7-1.378 3.077-3.077 3.077h-1.846A3.077 3.077 0 0 1 8 11.923.923.923 0 0 0 7.077 11H2.072a2 2 0 0 0-.048.22C2 11.376 2 11.534 2 11.85V12c0 2.8 0 4.2.545 5.27a5 5 0 0 0 2.185 2.185C5.8 20 7.2 20 10 20Z" fill="none"/>
    </svg>
  );
};

export default IconInboxDuoStroke;
