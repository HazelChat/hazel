import type { SVGProps } from "react"

type IconProps = SVGProps<SVGSVGElement> & {
	secondaryfill?: string
	title?: string
}

export function IconDots({ fill = "currentColor", title = "dots", ...props }: IconProps) {
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
				<circle cx="9" cy="9" r="1.25" fill={fill} />
				<circle cx="3.25" cy="9" r="1.25" fill={fill} />
				<circle cx="14.75" cy="9" r="1.25" fill={fill} />
			</g>
		</svg>
	)
}

export default IconDots
