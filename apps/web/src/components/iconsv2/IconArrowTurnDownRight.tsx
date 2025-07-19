// solid/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconArrowTurnDownRight: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M3 4a1 1 0 1 1 2 0v3c0 1.417 0 2.419.065 3.203.063.772.182 1.243.371 1.613a4 4 0 0 0 1.748 1.748c.37.189.842.308 1.613.371C9.581 14 10.583 14 12 14h2.627a23 23 0 0 0-.175-2 49 49 0 0 0-.296-1.83 1 1 0 0 1 1.58-.974 26.2 26.2 0 0 1 4.87 4.684 1.79 1.79 0 0 1 0 2.24 26.2 26.2 0 0 1-4.87 4.684 1 1 0 0 1-1.58-.973A49 49 0 0 0 14.452 18q.132-.997.175-2h-2.67c-1.364 0-2.448 0-3.322-.071-.896-.074-1.66-.227-2.359-.583a6 6 0 0 1-2.622-2.622c-.356-.7-.51-1.463-.583-2.359C3 9.491 3 8.407 3 7.044z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconArrowTurnDownRight
