// stroke/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconMetaStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 10.106c1.832-2.887 3.111-4.33 4.82-4.33 5.552 0 6.655 12.447 2.075 12.447-2.971 0-5.78-5.817-6.895-8.117Zm0 0c-1.832-2.887-3.112-4.33-4.82-4.33-5.552 0-6.655 12.447-2.075 12.447 2.966 0 5.79-5.814 6.895-8.117Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconMetaStroke
