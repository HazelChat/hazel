// solid/devices
import type { Component, JSX } from 'solid-js';

export const IconVideoCall: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path fill-rule="evenodd" d="M13 4a5 5 0 0 1 4.704 3.302l.366-.307C20.022 5.355 23 6.743 23 9.292v5.416c0 2.55-2.978 3.937-4.93 2.297l-.366-.307A5 5 0 0 1 13 20H6a5 5 0 0 1-5-5V9a5 5 0 0 1 5-5zm5.001 9.915V10.08a1 1 0 0 1 .356-.714l1-.84A1 1 0 0 1 21 9.292v5.416a1 1 0 0 1-1.643.766l-1-.84a1 1 0 0 1-.356-.72Z" clip-rule="evenodd" fill="currentColor"/>
    </svg>
  );
};

export default IconVideoCall;
