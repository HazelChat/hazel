import type { SVGProps } from "react"

type IconProps = SVGProps<SVGSVGElement> & {
	secondaryfill?: string
	title?: string
}

export function IconSend({ fill = "currentColor", secondaryfill, title = "send", ...props }: IconProps) {
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
				<path
					d="M16.707 1.293C16.512 1.098 16.256 1 16 1C15.879 1 15.757 1.025 15.639 1.075L1.639 6.575C1.254 6.727 1.004 7.097 1 7.51C0.996 7.923 1.24 8.297 1.622 8.456L7.5 10.5L9.544 16.378C9.703 16.76 10.077 17.004 10.49 17C10.903 16.996 11.273 16.746 11.425 16.361L16.925 2.361C17.025 2.112 16.992 1.831 16.853 1.61C16.81 1.543 16.761 1.478 16.707 1.293Z"
					fill={secondaryfill}
					opacity="0.4"
				/>
				<path d="M16.707 1.293L7.5 10.5L16.707 1.293Z" fill={fill} />
				<path
					d="M7.5 10.5L16.707 1.293"
					stroke={fill}
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</g>
		</svg>
	)
}

export default IconSend
