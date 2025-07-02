// duo-solid/time
import type { Component, JSX } from 'solid-js';

export const IconAlarmDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path fill="currentColor" d="M12 4a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z" opacity=".28"/><path stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3 2 6m17-3 3 3m-10 4v3.717a.5.5 0 0 0 .243.429L14.5 15.5"/>
    </svg>
  );
};

export default IconAlarmDuoSolid;
