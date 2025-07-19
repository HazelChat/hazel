// icons/svgs/contrast/devices

import type React from "react"
import type { SVGProps } from "react"

export const IconSpeakerOff1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g fill="currentColor" opacity=".28">
				<path
					fill="currentColor"
					d="M19.564 4.184q.043.084.08.172L4.356 19.644C4 18.81 4 17.694 4 15.6V8.4c0-2.24 0-3.36.436-4.216a4 4 0 0 1 1.748-1.748C7.04 2 8.16 2 10.4 2h3.2c2.24 0 3.36 0 4.216.436a4 4 0 0 1 1.748 1.748Z"
				/>
				<path
					fill="currentColor"
					d="M21 9.656a1 1 0 0 0-1.707-.707l-4.174 4.174a1 1 0 0 0-.25.999q.13.415.131.878a3 3 0 0 1-3.878 2.87 1 1 0 0 0-1 .249l-3.114 3.114a1 1 0 0 0 .62 1.704C8.348 23 9.24 23 10.353 23h3.29c1.084 0 1.958 0 2.666-.058.729-.06 1.369-.185 1.96-.487a5 5 0 0 0 2.186-2.185c.302-.592.428-1.233.487-1.962.058-.707.058-1.581.058-2.665z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m22 2-2.356 2.356M2 22l2.356-2.356m3.36 2.297C8.39 22 9.246 22 10.4 22h3.2c2.24 0 3.36 0 4.216-.436a4 4 0 0 0 1.748-1.748C20 18.96 20 17.84 20 15.6V9.656m-9.17 9.17a4 4 0 0 0 4.996-4.996m3.818-9.474a4 4 0 0 0-1.828-1.92C16.96 2 15.84 2 13.6 2h-3.2c-2.24 0-3.36 0-4.216.436a4 4 0 0 0-1.748 1.748C4 5.04 4 6.16 4 8.4v7.2c0 2.094 0 3.209.356 4.044M19.644 4.356 12.9 11.1m0 0a4 4 0 0 0-4.797 4.797M12.9 11.1l-4.8 4.8m0 0-3.745 3.745M12 6.501h.01m-.01.502a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1Z"
			/>
		</svg>
	)
}

export default IconSpeakerOff1
