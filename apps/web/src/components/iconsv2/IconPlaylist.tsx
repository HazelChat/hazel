// solid/media
import type { Component, JSX } from 'solid-js';

export const IconPlaylist: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path fill-rule="evenodd" d="M17 3 7 3.001a1 1 0 0 1 0-2L17 1a1 1 0 1 1 0 2ZM4 6a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1Zm13.04 3H6.96c-.666 0-1.226 0-1.683.037-.48.04-.934.124-1.366.345a3.5 3.5 0 0 0-1.53 1.529c-.22.432-.305.887-.344 1.366C2 12.735 2 13.294 2 13.96v4.08c0 .666 0 1.226.037 1.683.04.48.124.934.344 1.366a3.5 3.5 0 0 0 1.53 1.53c.432.22.887.305 1.366.344C5.734 23 6.294 23 6.96 23h10.08c.666 0 1.226 0 1.683-.037.48-.04.934-.125 1.366-.345a3.5 3.5 0 0 0 1.53-1.529c.22-.432.305-.887.344-1.366.037-.457.037-1.017.037-1.683v-4.08c0-.666 0-1.226-.037-1.683-.04-.48-.125-.934-.345-1.366a3.5 3.5 0 0 0-1.529-1.53c-.432-.22-.887-.305-1.366-.344C18.266 9 17.706 9 17.04 9Z" clip-rule="evenodd" fill="currentColor"/>
    </svg>
  );
};

export default IconPlaylist;
