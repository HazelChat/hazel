// duo-solid/media
import type { Component, JSX } from "solid-js"

export const IconMusicQuaverNoteOffDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill-rule="evenodd"
				d="M13.926 3.07a.64.64 0 0 0-.926.573V12a1 1 0 1 1-2 0V3.643c0-1.962 2.065-3.24 3.821-2.362a7.56 7.56 0 0 1 3.89 4.696 1 1 0 0 1-1.923.547 5.56 5.56 0 0 0-2.862-3.454ZM8.618 15.856a1 1 0 0 1-.474 1.332 2 2 0 0 0-.952.952 1 1 0 1 1-1.806-.858 4 4 0 0 1 1.9-1.9 1 1 0 0 1 1.332.474Zm3.382.798a1 1 0 0 1 1 1v1.344a4 4 0 0 1-5.503 3.71 1 1 0 0 1-.331-1.634l3.909-3.91a1 1 0 0 1 .117-.1 1 1 0 0 1 .808-.41Z"
				clip-rule="evenodd"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M22 2 2 22"
			/>
		</svg>
	)
}

export default IconMusicQuaverNoteOffDuoSolid
