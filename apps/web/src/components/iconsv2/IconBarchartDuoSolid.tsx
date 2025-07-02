// duo-solid/chart-&-graph
import type { Component, JSX } from 'solid-js';

export const IconBarchartDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <g fill="currentColor" opacity=".28"><path fill="currentColor"  d="M2 13.667c0-.62 0-.93.068-1.185a2 2 0 0 1 1.414-1.414C3.737 11 4.047 11 4.667 11s.93 0 1.184.068a2 2 0 0 1 1.414 1.414c.068.255.068.565.068 1.185V20.4c0 .56 0 .84-.109 1.054a1 1 0 0 1-.437.437C6.573 22 6.293 22 5.733 22H5.2c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874C2 20.48 2 19.92 2 18.8z"/><path fill="currentColor"  d="M16.667 9.667c0-.62 0-.93.068-1.185a2 2 0 0 1 1.414-1.414C18.403 7 18.713 7 19.333 7s.93 0 1.185.068a2 2 0 0 1 1.414 1.414c.068.255.068.565.068 1.185V18.8c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C20.48 22 19.92 22 18.8 22h-.533c-.56 0-.84 0-1.054-.109a1 1 0 0 1-.437-.437c-.11-.214-.11-.494-.11-1.054z"/></g><path fill="currentColor" d="M9.333 4.667c0-.62 0-.93.068-1.185a2 2 0 0 1 1.415-1.414C11.07 2 11.38 2 12 2s.93 0 1.184.068a2 2 0 0 1 1.414 1.414c.069.255.069.565.069 1.185V20.4c0 .56 0 .84-.11 1.054a1 1 0 0 1-.436.437c-.214.109-.494.109-1.054.109h-2.134c-.56 0-.84 0-1.054-.109a1 1 0 0 1-.437-.437c-.109-.214-.109-.494-.109-1.054z"/>
    </svg>
  );
};

export default IconBarchartDuoSolid;
