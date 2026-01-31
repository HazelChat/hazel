import type { SVGProps } from "react"

type IconProps = SVGProps<SVGSVGElement> & {
	secondaryfill?: string
	title?: string
}

export function IconCloud({ fill = "currentColor", secondaryfill, title = "cloud", ...props }: IconProps) {
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
					d="M14.25 15H4.5C2.567 15 1 13.433 1 11.5C1 9.776 2.244 8.344 3.886 8.066C3.886 8.044 3.875 8.023 3.875 8C3.875 5.239 6.114 3 8.875 3C11.086 3 12.948 4.435 13.584 6.422C15.513 6.778 17 8.467 17 10.5C17 12.981 14.981 15 14.25 15Z"
					fill={secondaryfill}
					opacity="0.4"
				/>
				<path
					d="M14.25 14.25H4.5C2.981 14.25 1.75 13.019 1.75 11.5C1.75 10.138 2.738 8.993 4.05 8.777C4.338 8.731 4.564 8.509 4.619 8.222C4.847 7.025 5.671 6.018 6.78 5.545C7.889 5.072 9.142 5.208 10.13 5.898C10.367 6.063 10.68 6.044 10.897 5.853C11.551 5.279 12.4 4.959 13.284 4.959C15.248 4.959 16.25 6.594 16.25 8.125C16.25 9.656 14.832 14.25 14.25 14.25Z"
					fill={fill}
				/>
			</g>
		</svg>
	)
}

export default IconCloud
