// duo-stroke/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconMastodonDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M17.852 19.296q-5.335.367-7.752-1.077c-.724-.433-.23-1.27.609-1.194 2.856.259 6.304.086 8.124-1.68.92-.895 1.39-1.962 1.39-5.082s-.024-4.23-1.39-5.79c-2.248-2.568-11.418-2.57-13.666 0-1.366 1.56-1.39 2.669-1.39 5.789l.028 1.186c.071 13.251 12.048 9.917 14.047 7.848Z"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 11.312V8.386m0 0c0-1.258-.895-2.278-2-2.278s-2 1.02-2 2.278v4.722m4-4.722c0-1.258.895-2.278 2-2.278s2 1.02 2 2.278v4.722"
				fill="none"
			/>
		</svg>
	)
}

export default IconMastodonDuoStroke
