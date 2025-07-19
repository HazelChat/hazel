// stroke/general
import type { Component, JSX } from "solid-js"

export const IconHeartBreakStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 5.427C8.832.653 2 3.502 2 8.944 2 15.977 11 21 12 21s10-5.023 10-12.056c0-5.437-6.837-8.282-10-3.517Zm0 0a11.5 11.5 0 0 1 1.985 4.498.11.11 0 0 1-.049.118l-2.896 1.93a.07.07 0 0 0-.032.074c.252 1.517.837 2.894 1.992 3.953"
				fill="none"
			/>
		</svg>
	)
}

export default IconHeartBreakStroke
