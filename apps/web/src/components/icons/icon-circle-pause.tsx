import type { SVGProps } from "react"

type IconProps = SVGProps<SVGSVGElement> & {
	secondaryfill?: string
	strokewidth?: number
}

export function IconCirclePause({ fill = "currentColor", secondaryfill, ...props }: IconProps) {
	secondaryfill = secondaryfill || fill

	return (
		<svg height="18" width="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" {...props}>
			<g fill={fill}>
				<circle cx="9" cy="9" fill={secondaryfill} opacity=".3" r="7.25" strokeWidth="0" />
				<circle
					cx="9"
					cy="9"
					fill="none"
					r="7.25"
					stroke={fill}
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="1.5"
				/>
				<line
					fill="none"
					stroke={fill}
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="1.5"
					x1="6.75"
					x2="6.75"
					y1="11.75"
					y2="6.25"
				/>
				<line
					fill="none"
					stroke={fill}
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="1.5"
					x1="11.25"
					x2="11.25"
					y1="11.75"
					y2="6.25"
				/>
			</g>
		</svg>
	)
}

export default IconCirclePause
