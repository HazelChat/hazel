import type { SVGProps } from "react"

type IconProps = SVGProps<SVGSVGElement> & {
	secondaryfill?: string
	title?: string
}

export function IconAlertCircle({
	fill = "currentColor",
	secondaryfill,
	title = "alert-circle",
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
					d="M9 5C9.414 5 9.75 5.336 9.75 5.75V9.25C9.75 9.664 9.414 10 9 10C8.586 10 8.25 9.664 8.25 9.25V5.75C8.25 5.336 8.586 5 9 5Z"
					fill={fill}
				/>
				<circle cx="9" cy="12.25" r="1" fill={fill} />
			</g>
		</svg>
	)
}

export default IconAlertCircle
