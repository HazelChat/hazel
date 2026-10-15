import { UserId } from "@hazel/schema"
import { Effect, Schema } from "effect"
import { Command } from "foldkit"
import { File } from "foldkit/file"
import { calculateInitialCrop, cropImage, loadImage } from "~/utils/image-crop"
import { detectBrowserTimezone } from "~/utils/timezone"
import { publicUrlOf, uploadFile } from "../../settings/upload"
import { updateUser } from "../user"
import { CropRect } from "./crop"
import { Message } from "./message"
import { FILE_INPUT_ID, FormValues } from "./model"

const OUTPUT_SIZE = 512

/** `detectBrowserTimezone()`, the form's fallback timezone, read outside `init` and `update`. */
export const ReadProfileBrowserTimezone = Command.define("ReadProfileBrowserTimezone", {
	messages: [Message.DetectedBrowserTimezone],
	execute: Effect.sync(() => Message.DetectedBrowserTimezone({ browserTimezone: detectBrowserTimezone() })),
})

/** FileTrigger: pressing the button clicks the hidden file input. */
export const OpenFilePicker = Command.define("OpenFilePicker", {
	messages: [Message.CompletedOpenFilePicker],
	execute: Effect.sync(() => {
		document.getElementById(FILE_INPUT_ID)?.click()
		return Message.CompletedOpenFilePicker()
	}),
})

/** `AvatarCropModal`'s effect: an object URL for the file, then the largest centered square. */
export const LoadCropImage = Command.define("LoadCropImage", {
	args: { file: File, loadId: Schema.Number },
	messages: [Message.LoadedCropImage, Message.FailedLoadCropImage],
	execute: ({ file, loadId }) => {
		const src = URL.createObjectURL(file)
		return loadImage(src).pipe(
			Effect.map((image) =>
				Message.LoadedCropImage({
					loadId,
					image: {
						src,
						width: image.naturalWidth,
						height: image.naturalHeight,
						crop: calculateInitialCrop(image.naturalWidth, image.naturalHeight),
						drag: null,
					},
				}),
			),
			Effect.catch(() =>
				Effect.sync(() => {
					URL.revokeObjectURL(src)
					return Message.FailedLoadCropImage({ loadId })
				}),
			),
		)
	},
})

export const RevokeCropImage = Command.define("RevokeCropImage", {
	args: { src: Schema.String },
	messages: [Message.CompletedRevokeCropImage],
	execute: ({ src }) =>
		Effect.sync(() => {
			URL.revokeObjectURL(src)
			return Message.CompletedRevokeCropImage()
		}),
})

export const CropAvatarImage = Command.define("CropAvatarImage", {
	args: { src: Schema.String, crop: CropRect },
	messages: [Message.CompletedCropImage],
	execute: ({ src, crop }) =>
		loadImage(src).pipe(
			Effect.flatMap((image) => cropImage(image, crop, OUTPUT_SIZE)),
			Effect.map((blob) => Message.CompletedCropImage({ blob })),
			Effect.catch(() => Effect.succeed(Message.CompletedCropImage({ blob: null }))),
		),
})

/** `useProfilePictureUpload`: upload the cropped image, then point the user's avatar at it. */
export const UploadAvatar = Command.define("UploadAvatar", {
	args: { userId: UserId, blob: Schema.instanceOf(Blob) },
	messages: [Message.CompletedUploadAvatar],
	execute: ({ userId, blob }) =>
		Effect.gen(function* () {
			const file = new globalThis.File([blob], "avatar.webp", { type: "image/webp" })
			const key = yield* uploadFile({ type: "user-avatar" }, file)
			const avatarUrl = publicUrlOf(key)
			if (avatarUrl === null) return false
			yield* updateUser({ id: userId, avatarUrl })
			return true
		}).pipe(
			Effect.catch(() => Effect.succeed(false)),
			Effect.map((isUploaded) => Message.CompletedUploadAvatar({ isUploaded })),
		),
})

export const ResetAvatar = Command.define("ResetAvatar", {
	args: { userId: UserId },
	messages: [Message.CompletedResetAvatar],
	execute: ({ userId }) =>
		updateUser({ id: userId, avatarUrl: null }).pipe(
			Effect.as(true),
			Effect.catch(() => Effect.succeed(false)),
			Effect.map((isReset) => Message.CompletedResetAvatar({ isReset })),
		),
})

/** The legacy `onSubmit`: name and timezone in one `user.update`. */
export const SaveProfile = Command.define("SaveProfile", {
	args: { userId: UserId, values: FormValues },
	messages: [Message.CompletedSaveProfile],
	execute: ({ userId, values }) =>
		updateUser({
			id: userId,
			firstName: values.firstName,
			lastName: values.lastName,
			timezone: values.timezone,
		}).pipe(
			Effect.as(true),
			Effect.catch(() => Effect.succeed(false)),
			Effect.map((isSaved) => Message.CompletedSaveProfile({ isSaved })),
		),
})
