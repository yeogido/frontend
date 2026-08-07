import { useEffect, useRef, useState } from 'react';

import camera from '../../../assets/icons/camera.svg';
import { revokeObjectUrl } from '../../../utils/objectUrl';

export function BusinessCertificateUpload({
  scale,
  onChange,
}: {
  scale: number;
  onChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => revokeObjectUrl(previewUrl);
  }, [previewUrl]);

  const handleFileChange = (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return;
    const nextUrl = URL.createObjectURL(file);
    setPreviewUrl(nextUrl);
    onChange(file);
  };

  return (
    <div className="flex flex-col" style={{ gap: 12 * scale }}>
      <h2
        className="font-semibold text-[#1c1c1c]"
        style={{ fontSize: 16 * scale, lineHeight: `${19 * scale}px` }}
      >
        사업자등록증 업로드
      </h2>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          handleFileChange(event.target.files?.[0]);
          event.target.value = '';
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative flex items-center justify-center overflow-hidden rounded-xl border border-dashed border-[#ff6f41] bg-[#fff7f5]"
        style={{ height: 213 * scale }}
      >
        <>
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="사업자등록증 미리보기"
              className="size-full object-cover"
            />
          ) : (
            <div
              className="flex flex-col items-center"
              style={{ gap: 18 * scale }}
            >
              <span
                className="flex items-center justify-center rounded-full bg-[#fbd0c2]"
                style={{ width: 51 * scale, height: 51 * scale }}
              >
                <img
                  src={camera}
                  alt=""
                  aria-hidden="true"
                  style={{ width: 32 * scale, height: 32 * scale }}
                />
              </span>
              <div
                className="flex flex-col items-center"
                style={{ gap: 12 * scale }}
              >
                <strong
                  className="font-semibold text-[#1c1c1c]"
                  style={{
                    fontSize: 14 * scale,
                    lineHeight: `${17 * scale}px`,
                  }}
                >
                  사업자등록증을 추가해 주세요.
                </strong>
                <span
                  className="text-[#1c1c1c]"
                  style={{
                    fontSize: 12 * scale,
                    lineHeight: `${14 * scale}px`,
                  }}
                >
                  여기를 탭해서 업로드할 수 있어요.
                </span>
              </div>
            </div>
          )}
        </>
      </button>
    </div>
  );
}
