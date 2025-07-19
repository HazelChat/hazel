// solid/development
import type { Component, JSX } from "solid-js"

export const IconBug: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill-rule="evenodd"
				d="M3 2a1 1 0 0 1 1 1v2.54a2 2 0 0 0 1.539 1.947q.445-.648.997-1.196A1 1 0 0 1 7.241 6H8a4 4 0 1 1 8 0h.76a1 1 0 0 1 .704.29 8.4 8.4 0 0 1 .998 1.197A2 2 0 0 0 20 5.54V3a1 1 0 1 1 2 0v2.54a4 4 0 0 1-2.592 3.745 9.1 9.1 0 0 1 .362 5.249l.015.003A4 4 0 0 1 23 18.46V21a1 1 0 1 1-2 0v-2.54a2 2 0 0 0-1.608-1.962l-.3-.06c-1.18 2.393-3.418 4.143-6.092 4.497V13a1 1 0 1 0-2 0v7.935c-2.674-.354-4.911-2.104-6.091-4.497l-.301.06A2 2 0 0 0 3 18.46V21a1 1 0 1 1-2 0v-2.54a4 4 0 0 1 3.216-3.923l.015-.003A9 9 0 0 1 4 12.5c0-1.135.21-2.221.592-3.215A4 4 0 0 1 2 5.541V3a1 1 0 0 1 1-1Zm11 4a2 2 0 1 0-4 0z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconBug
