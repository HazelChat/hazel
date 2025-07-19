// contrast/medical
import type { Component, JSX } from "solid-js"

export const IconSyringeInjection1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="m14.192 5.423 4.385 4.385-8.477 8.477c-.614.613-.921.92-1.275 1.035a1.55 1.55 0 0 1-.958 0c-.354-.114-.66-.422-1.275-1.035l-.877-.877c-.614-.614-.92-.921-1.036-1.275a1.55 1.55 0 0 1 0-.958c.115-.354.422-.661 1.036-1.275z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m14.192 5.423 2.193 2.192m-2.193-2.192-1.461-1.461m1.461 1.461L10.54 9.077m5.846-1.462 2.192 2.193m-2.192-2.193 3.653-3.653m-1.461 5.846L10.1 18.285c-.614.613-.92.92-1.275 1.035a1.55 1.55 0 0 1-.958 0c-.354-.114-.66-.422-1.275-1.035l-.438-.439m12.423-8.038 1.461 1.461M6.154 17.846l-.439-.438c-.614-.614-.92-.921-1.035-1.275a1.55 1.55 0 0 1 0-.958c.115-.354.421-.661 1.035-1.275l1.9-1.9m-1.461 5.846L2.5 21.5M20.039 3.962 18.577 2.5m1.461 1.462L21.5 5.423M10.539 9.077l2.192 2.192m-2.192-2.192L7.615 12m0 0 2.193 2.192"
			/>
		</svg>
	)
}

export default IconSyringeInjection1
