// duo-stroke/devices
import type { Component, JSX } from "solid-js"

export const IconSpeakerOffDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				clip-path="url(#icon-mz7ek8jk9-a)"
			>
				<path
					fill="currentColor"
					d="M7.715 21.94c.676.06 1.532.06 2.685.06h3.2c2.24 0 3.36 0 4.216-.436a4 4 0 0 0 1.748-1.748C20 18.96 20 17.84 20 15.6V9.656m-9.17 9.17a4 4 0 0 0 4.996-4.996m3.818-9.474a4 4 0 0 0-1.828-1.92C16.96 2 15.84 2 13.6 2h-3.2c-2.24 0-3.36 0-4.216.436a4 4 0 0 0-1.748 1.748C4 5.04 4 6.16 4 8.4v7.2c0 2.094 0 3.209.356 4.044m8.543-8.543a4 4 0 0 0-4.797 4.797M12 6.502h.01m-.01.502a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1Z"
					opacity=".28"
				/>
				<path fill="currentColor" d="M22 2 2 22" />
			</g>
			<defs>
				<clipPath id="icon-mz7ek8jk9-a">
					<path fill="currentColor" d="M0 0h24v24H0z" />
				</clipPath>
			</defs>
		</svg>
	)
}

export default IconSpeakerOffDuoStroke
