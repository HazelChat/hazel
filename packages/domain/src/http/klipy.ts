import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema } from "@effect/platform"
import { Schema } from "effect"
import { CurrentUser } from "../"

// ============ Response Schemas ============

export class KlipyFileVariant extends Schema.Class<KlipyFileVariant>("KlipyFileVariant")({
	url: Schema.String,
	width: Schema.Number,
	height: Schema.Number,
	size: Schema.Number,
}) {}

export class KlipyFileResolution extends Schema.Class<KlipyFileResolution>("KlipyFileResolution")({
	gif: KlipyFileVariant,
	webp: KlipyFileVariant,
	jpg: KlipyFileVariant,
	mp4: KlipyFileVariant,
	webm: KlipyFileVariant,
}) {}

export class KlipyFile extends Schema.Class<KlipyFile>("KlipyFile")({
	hd: KlipyFileResolution,
	md: KlipyFileResolution,
	sm: KlipyFileResolution,
	xs: KlipyFileResolution,
}) {}

export class KlipyGif extends Schema.Class<KlipyGif>("KlipyGif")({
	id: Schema.Number,
	slug: Schema.String,
	title: Schema.String,
	file: KlipyFile,
	type: Schema.String,
	blur_preview: Schema.String,
}) {}

export class KlipySearchResponse extends Schema.Class<KlipySearchResponse>("KlipySearchResponse")({
	data: Schema.Array(KlipyGif),
	current_page: Schema.Number,
	per_page: Schema.Number,
	has_next: Schema.Boolean,
}) {}

export class KlipyCategory extends Schema.Class<KlipyCategory>("KlipyCategory")({
	category: Schema.String,
	query: Schema.String,
	preview_url: Schema.String,
}) {}

export class KlipyCategoriesResponse extends Schema.Class<KlipyCategoriesResponse>("KlipyCategoriesResponse")(
	{
		categories: Schema.Array(KlipyCategory),
	},
) {}

// ============ Error Schemas ============

export class KlipyApiError extends Schema.TaggedError<KlipyApiError>("KlipyApiError")(
	"KlipyApiError",
	{
		message: Schema.String,
	},
	HttpApiSchema.annotations({
		status: 502,
	}),
) {}

// ============ API Group ============

export class KlipyGroup extends HttpApiGroup.make("klipy")
	.add(
		HttpApiEndpoint.get("trending", "/trending")
			.setUrlParams(
				Schema.Struct({
					page: Schema.optionalWith(Schema.NumberFromString, { default: () => 1 }),
					per_page: Schema.optionalWith(Schema.NumberFromString, { default: () => 25 }),
				}),
			)
			.addSuccess(KlipySearchResponse)
			.addError(KlipyApiError),
	)
	.add(
		HttpApiEndpoint.get("search", "/search")
			.setUrlParams(
				Schema.Struct({
					q: Schema.String,
					page: Schema.optionalWith(Schema.NumberFromString, { default: () => 1 }),
					per_page: Schema.optionalWith(Schema.NumberFromString, { default: () => 25 }),
				}),
			)
			.addSuccess(KlipySearchResponse)
			.addError(KlipyApiError),
	)
	.add(
		HttpApiEndpoint.get("categories", "/categories")
			.addSuccess(KlipyCategoriesResponse)
			.addError(KlipyApiError),
	)
	.prefix("/klipy")
	.middleware(CurrentUser.Authorization) {}
