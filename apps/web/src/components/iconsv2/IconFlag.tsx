// solid/general
import type { Component, JSX } from "solid-js"

export const IconFlag: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12.526 3.052a7.03 7.03 0 0 0-5.777-.738l-.843.261A1 1 0 0 0 4 3v18a1 1 0 1 0 2 0v-6.253a5 5 0 0 0 .458-.152c.111-.042.22-.091.333-.13a5.6 5.6 0 0 1 4.562.442 7.6 7.6 0 0 0 6.01.66l1.309-.405A1.89 1.89 0 0 0 20 13.36V4.485c0-.267-.064-.577-.27-.854a1.35 1.35 0 0 0-.723-.492c-.423-.12-.857-.04-1.117.02-.298.07-.591.176-.811.26-.14.053-.278.114-.42.161a5.03 5.03 0 0 1-4.133-.528Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconFlag
