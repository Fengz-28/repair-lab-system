export type IntakePhotoPlaceholder = {
  originalName: string;
  mimeType: string;
  byteSize: number;
};

export type PreparedPrivatePhoto = IntakePhotoPlaceholder & {
  storageKey: string;
};

export function preparePrivateIntakePhoto(
  intakeId: string,
  index: number,
  photo: IntakePhotoPlaceholder,
): PreparedPrivatePhoto {
  const safeName = photo.originalName
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);

  return {
    ...photo,
    storageKey: `private-placeholder/intakes/${intakeId}/${index + 1}-${safeName}`,
  };
}

