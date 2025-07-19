// duo-solid/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconRefreshDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M8 18.928a8 8 0 0 0 11.909-8.136m-3.91-5.72a8 8 0 0 0-11.841 8.51"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				fill-rule="evenodd"
				d="M17.51 1.47a1 1 0 0 1 .91.607 16 16 0 0 1 1.118 3.975 1.48 1.48 0 0 1-.917 1.588 16 16 0 0 1-4.001 1.02 1 1 0 0 1-.932-1.577l.358-.498a23 23 0 0 0 2.29-3.968l.253-.558a1 1 0 0 1 .921-.589Z"
				clip-rule="evenodd"
			/>
			<path
				fill="currentColor"
				fill-rule="evenodd"
				d="M9.38 15.337a1 1 0 0 1 .932 1.577l-.358.497a23 23 0 0 0-2.29 3.968l-.252.558a1 1 0 0 1-1.832-.018 16 16 0 0 1-1.118-3.975 1.48 1.48 0 0 1 .917-1.588 16 16 0 0 1 4.001-1.019Z"
				clip-rule="evenodd"
			/>
		</svg>
	)
}

export default IconRefreshDuoSolid
