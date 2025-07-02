// duo-solid/users
import type { Component, JSX } from 'solid-js';

export const IconUserDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path fill="currentColor" d="M8 14a5 5 0 0 0-5 5 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 5 5 0 0 0-5-5z" opacity=".28"/><path fill="currentColor" d="M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z"/>
    </svg>
  );
};

export default IconUserDuoSolid;
