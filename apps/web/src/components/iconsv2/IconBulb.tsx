// solid/appliances
import type { Component, JSX } from 'solid-js';

export const IconBulb: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path fill-rule="evenodd" d="M4 9.737C4 5.428 7.618 2 12 2s8 3.428 8 7.737c0 2.357-1.09 4.46-2.79 5.872-.548.454-.914.936-1.046 1.442l-.28 1.078A2.5 2.5 0 0 1 13.465 20h-2.929a2.5 2.5 0 0 1-2.42-1.871l-.28-1.078c-.13-.506-.497-.988-1.044-1.442C5.09 14.197 4 12.094 4 9.737ZM11 11a1 1 0 1 0 0 2v3a1 1 0 1 0 2 0v-3a1 1 0 1 0 0-2z" clip-rule="evenodd" fill="currentColor"/><path d="M9 22a1 1 0 0 1 1-1h4a1 1 0 1 1 0 2h-4a1 1 0 0 1-1-1Z" fill="currentColor"/>
    </svg>
  );
};

export default IconBulb;
