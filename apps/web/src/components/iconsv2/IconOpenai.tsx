// contrast/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconOpenai: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M7 6a3 3 0 0 1 5.98-.34l1.716-.99a3 3 0 0 1 3.285 5.01l1.715.99A3 3 0 0 1 17 16.02V18a3 3 0 0 1-5.981.34l-1.715.99a3 3 0 0 1-3.285-5.01l-1.715-.99A3 3 0 0 1 7 7.98z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M10.269 12.961 7.97 11.583A2 2 0 0 1 7 9.868V7.98m3.268 4.98 1.699 1.019m-1.699-1.019.034-1.98m1.665 2.999-2.343 1.3a2 2 0 0 1-1.97-.016l-1.635-.944m5.948-.34 1.731-.961m0 0-.045 2.679a2 2 0 0 1-1 1.698l-1.634.944m2.679-5.321.033-1.98m0 0 2.298 1.378a2 2 0 0 1 .97 1.715v1.888m-3.268-4.981-1.698-1.019m0 0 2.343-1.3a2 2 0 0 1 1.97.016l1.635.944m-5.948.34-1.731.961m0 0 .045-2.679a2 2 0 0 1 1-1.698l1.634-.944M7 7.98a3 3 0 0 0-2.696 5.35l1.715.99m.98-6.34V6a3 3 0 0 1 5.982-.34m-6.962 8.66a3 3 0 0 0 3.285 5.01l1.715-.99m0 0a3 3 0 0 0 5.98-.34v-1.98m0 0a3 3 0 0 0 2.697-5.35l-1.715-.99m0 0a3 3 0 0 0-3.285-5.01l-1.715.99"
			/>
		</svg>
	)
}

export default IconOpenai
