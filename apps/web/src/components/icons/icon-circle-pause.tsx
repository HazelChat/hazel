import type { SVGProps } from "react"

type IconProps = SVGProps<SVGSVGElement> & {
	secondaryfill?: string
	title?: string
}

export function IconCirclePause({
	fill = "currentColor",
	secondaryfill,
	title = "pause",
	...props
}: IconProps) {
	secondaryfill = secondaryfill || fill

	return (
		<svg
			height="18"
			width="18"
			data-slot="icon"
			viewBox="0 0 18 18"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<title>{title}</title>
			<g fill={fill}>
				<circle cx="9" cy="9" r="8" fill={secondaryfill} opacity="0.4" />
				<path
					d="m6.75,12.5c-.4141,0-.75-.3359-.75-.75v-5.5c0-.4141.3359-.75.75-.75s.75.3359.75.75v5.5c0,.4141-.3359.75-.75.75Z"
					fill={fill}
				/>
				<path
					d="m11.25,12.5c-.4141,0-.75-.3359-.75-.75v-5.5c0-.4141.3359-.75.75-.75s.75.3359.75.75v5.5c0,.4141-.3359.75-.75.75Z"
					fill={fill}
				/>
			</g>
		</svg>
	)
}

export default IconCirclePause
