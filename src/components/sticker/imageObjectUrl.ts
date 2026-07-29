interface ObjectUrlApi {
  createObjectURL: (file: File) => string;
  revokeObjectURL: (url: string) => void;
}

export const createImageObjectUrl = (file: File, objectUrlApi: ObjectUrlApi) => {
  const url = objectUrlApi.createObjectURL(file);

  return {
    url,
    dispose: () => objectUrlApi.revokeObjectURL(url),
  };
};
