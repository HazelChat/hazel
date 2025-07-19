// contrast/general
import type { Component, JSX } from "solid-js"

export const IconHeartSupport1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path
				fill="currentColor"
				d="M12 21C11 21 2 15.977 2 8.944 2 3.502 8.832.654 12 5.427c3.162-4.765 10-1.92 10 3.517 0 1.85-.623 3.562-1.56 5.08C17.817 18.273 12.737 21 12 21Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 5.427C8.832.653 2 3.502 2 8.944 2 15.977 11 21 12 21c.737 0 5.817-2.727 8.44-6.976M12 5.427c3.162-4.765 10-1.92 10 3.517 0 1.85-.623 3.562-1.56 5.08M12 5.427l-2.81 3.56a2.168 2.168 0 0 0 3.334 2.771L14.5 9.5a9.66 9.66 0 0 0 5.94 4.524"
			/>
		</svg>
	)
}

export default IconHeartSupport1
