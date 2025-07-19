// duo-stroke/media
import type { Component, JSX } from "solid-js"

export const IconMusicQuaverNoteOffDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 18.998a3 3 0 0 1-4.127 2.783M12 18.998c0-.398-.078-.778-.219-1.126M12 18.998v-1.344M12 12V3.643a1.64 1.64 0 0 1 2.373-1.468A6.56 6.56 0 0 1 17.75 6.25M7.715 16.285a3 3 0 0 0-1.426 1.426"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M22 2 2 22"
				fill="none"
			/>
		</svg>
	)
}

export default IconMusicQuaverNoteOffDuoStroke
