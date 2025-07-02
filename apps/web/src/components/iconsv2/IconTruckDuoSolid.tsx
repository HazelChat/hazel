// duo-solid/automotive
import type { Component, JSX } from 'solid-js';

export const IconTruckDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path fill="currentColor" d="M5.161 4.5c-.527 0-.981 0-1.356.03-.395.033-.789.104-1.167.297a3 3 0 0 0-1.311 1.311c-.193.378-.264.772-.296 1.167C1 7.68 1 8.135 1 8.661v6.678c0 .527 0 .981.03 1.356.033.395.104.789.297 1.167a3 3 0 0 0 1.311 1.311c.462.235.946.302 1.335.324.257.014.553.01.784.006l.24-.003A1 1 0 0 0 6 18.5a1 1 0 1 1 2 0 1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-10c0-.485-.003-.91-.037-1.269-.035-.37-.109-.737-.29-1.093a3 3 0 0 0-1.311-1.311c-.378-.193-.772-.264-1.167-.296a18 18 0 0 0-1.356-.031z" opacity=".28"/><path stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 18.5v-10h2.834c.782 0 1.173 0 1.511.126a2 2 0 0 1 .781.529c.243.267.388.63.679 1.357L22 13.5v1.8c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874c-.564.287-1.298.216-1.908.218m-4 0a2 2 0 1 0 4 0m-4 0a2 2 0 1 1 4 0m-4 0H9m0 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"/>
    </svg>
  );
};

export default IconTruckDuoSolid;
