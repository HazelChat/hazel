import type { SVGProps } from "react"

type IconProps = SVGProps<SVGSVGElement> & {
	secondaryfill?: string
	title?: string
}

export function IconClose({ fill = "currentColor", title = "close", ...props }: IconProps) {
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
					d="m2.25,10.5c-.192,0-.384-.073-.53-.22-.293-.293-.293-.768,0-1.061L9.22,1.72c.293-.293.768-.293,1.061,0s.293.768,0,1.061l-7.5,7.5c-.146.146-.338.22-.53.22Z"
					fill={fill}
				/>
				<path
					d="m9.75,10.5c-.192,0-.384-.073-.53-.22L1.72,2.78c-.293-.293-.293-.768,0-1.061s.768-.293,1.061,0l7.5,7.5c.293.293.293.768,0,1.061-.146.146-.338.22-.53.22Z"
					fill={fill}
				/>
			</g>
		</svg>
	)
}

export default IconClose
