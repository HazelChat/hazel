// duo-solid/media
import type { Component, JSX } from "solid-js"

export const IconVolumeTwoDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M15 5.087c0-2.524-2.853-3.992-4.907-2.525L7.28 4.572a3.9 3.9 0 0 1-1.514.655A5.93 5.93 0 0 0 1 11.04v1.918a5.93 5.93 0 0 0 4.766 5.814 3.9 3.9 0 0 1 1.514.656l2.813 2.009c2.054 1.468 4.907 0 4.907-2.524z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M17 14c.317-.263.569-.574.74-.918.172-.343.26-.71.26-1.082 0-.371-.088-.74-.26-1.082A2.9 2.9 0 0 0 17 10m1 9c.786-.38 1.5-.939 2.102-1.642a7.8 7.8 0 0 0 1.405-2.459C21.832 13.98 22 12.996 22 12s-.168-1.98-.493-2.9a7.8 7.8 0 0 0-1.405-2.458A6.5 6.5 0 0 0 18 5"
			/>
		</svg>
	)
}

export default IconVolumeTwoDuoSolid
