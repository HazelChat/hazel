import type { SVGProps } from "react"

type IconProps = SVGProps<SVGSVGElement> & {
	secondaryfill?: string
	strokewidth?: number
	title?: string
}

export function IconGif({ fill = "currentColor", title = "GIF", ...props }: IconProps) {
	return (
		<svg
			height="18"
			width="18"
			data-slot="icon"
			{...props}
			viewBox="0 0 18 18"
			xmlns="http://www.w3.org/2000/svg"
		>
			<title>{title}</title>
			<g fill="none">
				<rect
					x="1.5"
					y="3.5"
					width="15"
					height="11"
					rx="2"
					stroke={fill}
					strokeWidth="1.5"
					strokeOpacity="0.4"
				/>
				<text
					x="9"
					y="10.5"
					textAnchor="middle"
					dominantBaseline="middle"
					fill={fill}
					fontSize="6"
					fontWeight="700"
					fontFamily="system-ui, sans-serif"
				>
					GIF
				</text>
			</g>
		</svg>
	)
}

export default IconGif
