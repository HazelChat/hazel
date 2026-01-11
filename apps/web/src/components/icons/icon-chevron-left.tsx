import type { SVGProps } from "react"

type IconProps = SVGProps<SVGSVGElement> & {
	secondaryfill?: string
	title?: string
}

export function IconChevronLeft({ fill = "currentColor", title = "chevron-left", ...props }: IconProps) {
	return (
		<svg
			height="12"
			width="12"
			data-slot="icon"
			viewBox="0 0 12 12"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<title>{title}</title>
			<g fill={fill}>
				<path
					d="m7.75,11c-.192,0-.384-.073-.53-.22L2.97,6.53c-.293-.293-.293-.768,0-1.061L7.22,1.22c.293-.293.768-.293,1.061,0s.293.768,0,1.061l-3.72,3.72,3.72,3.72c.293.293.293.768,0,1.061-.146.146-.338.22-.53.22Z"
					fill={fill}
				/>
			</g>
		</svg>
	)
}

export default IconChevronLeft
