// solid/communication
import type { Component, JSX } from 'solid-js';

export const IconPhone: Component<JSX.IntrinsicElements["svg"]> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "24"}
      height={props.height || "24"}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M8.046 12.173c-.405.376-.868.729-1.3 1.05a14.7 14.7 0 0 0 3.776 3.856c.44-.528.932-1.112 1.463-1.595a6.43 6.43 0 0 1 5.763-1.51c.797.182 1.747.47 2.544 1.005.829.558 1.514 1.405 1.66 2.64a6 6 0 0 1-.017 1.645c-.31 1.894-2.15 2.885-3.765 2.694-2.991-.353-5.684-1.277-7.983-2.704a16.8 16.8 0 0 1-5.641-5.772c-1.314-2.226-2.168-4.805-2.504-7.656-.19-1.615.799-3.456 2.694-3.766.516-.084 1.101-.067 1.541-.027 1.165.105 2.002.69 2.576 1.45.548.726.855 1.608 1.052 2.377a6.43 6.43 0 0 1-1.859 6.313Z" fill="currentColor"/>
    </svg>
  );
};

export default IconPhone;
