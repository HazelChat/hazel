import type { SVGProps } from "react"

type IconProps = SVGProps<SVGSVGElement> & {
	title?: string
}

export function IconBranch({ fill = "currentColor", title = "branch", ...props }: IconProps) {
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
			<path
				d="M5 3 V12 H13"
				fill="none"
				stroke={fill}
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}

export default IconBranch
