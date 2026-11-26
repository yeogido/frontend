import { useEffect, useRef, useState } from 'react';

import camera from '../../../assets/icons/camera.svg';
import search from '../../../assets/icons/search.svg';
import DatePicker from '../../../components/common/DatePicker';
import { revokeObjectUrl } from '../../../utils/objectUrl';
import type { PlaceItem } from '../../local-recommendation/place-selection/types';

// Figma 1440 데스크톱 시안(7193:53846) 기준 리터럴 px.
// 공용 DatePicker는 390 기준 크기(높이 42)를 scale로 키우는 구조라, 시안의 입력
// 높이 59에 가깝게 맞추는 배율을 준다.
const DATE_PICKER_SCALE = 59 / 42;

const INPUT_CLASS_NAME =
  'rounded-[12px] border border-[#e4e4e4] bg-[#f9f9f9] p-[20px] text-[16px] font-medium';

interface BusinessVerificationDesktopFormProps {
  readonly query: string;
  readonly searchResults: readonly PlaceItem[];
  readonly isSearching: boolean;
  readonly place: PlaceItem | null;
  readonly representativeName: string;
  readonly registrationNumber: string;
  readonly registrationNumberHint: string;
  readonly openedAt: string;
  readonly onCertificateChange: (certificate: File | null) => void;
  readonly onQueryChange: (value: string) => void;
  readonly onPlaceSelect: (place: PlaceItem) => void;
  readonly onPlaceClear: () => void;
  readonly onRepresentativeNameChange: (value: string) => void;
  readonly onRegistrationNumberChange: (value: string) => void;
  readonly onOpenedAtChange: (value: string) => void;
}

function SectionLabel({ children }: { readonly children: string }) {
  return (
    <span className="text-[20px] leading-[normal] font-semibold text-[#1c1c1c]">
      {children}
    </span>
  );
}

function CertificateUpload({
  onChange,
}: {
  readonly onChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => revokeObjectUrl(previewUrl);
  }, [previewUrl]);

  const handleFileChange = (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return;

    setPreviewUrl(URL.createObjectURL(file));
    onChange(file);
  };

  return (
    <div className="flex flex-col gap-[20px]">
      <SectionLabel>사업자등록증 업로드</SectionLabel>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-label="사업자등록증 파일 선택"
        onChange={(event) => {
          handleFileChange(event.target.files?.[0]);
          event.target.value = '';
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative flex h-[272px] items-center justify-center overflow-hidden rounded-[24px] border border-dashed border-[#ff6f41] bg-[#fff7f5]"
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="사업자등록증 미리보기"
            className="size-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-[18px]">
            <span className="flex size-[51px] items-center justify-center rounded-full bg-[#fbd0c2]">
              <img
                src={camera}
                alt=""
                aria-hidden="true"
                className="size-[32px]"
              />
            </span>
            <div className="flex flex-col items-center gap-[12px] text-[#1c1c1c]">
              <strong className="text-[20px] leading-[normal] font-semibold">
                사업자등록증을 추가해 주세요.
              </strong>
              <span className="text-[16px] leading-[normal]">
                여기를 탭해서 업로드할 수 있어요.
              </span>
            </div>
          </div>
        )}
      </button>
    </div>
  );
}

function PlaceSearch({
  query,
  results,
  isLoading,
  selectedPlace,
  onQueryChange,
  onSelect,
  onClear,
}: {
  readonly query: string;
  readonly results: readonly PlaceItem[];
  readonly isLoading: boolean;
  readonly selectedPlace: PlaceItem | null;
  readonly onQueryChange: (value: string) => void;
  readonly onSelect: (place: PlaceItem) => void;
  readonly onClear: () => void;
}) {
  const isDropdownOpen = !selectedPlace && Boolean(query.trim());

  return (
    <div className="flex flex-col gap-[20px]">
      <SectionLabel>사업장 주소</SectionLabel>

      {selectedPlace ? (
        // 인증 요청에는 주소 문자열뿐 아니라 카카오 장소 정보가 필수라, 주소를
        // 직접 입력받지 않고 검색 결과에서 고른 장소를 그대로 보여준다.
        <div
          className={`${INPUT_CLASS_NAME} flex items-center justify-between gap-[16px]`}
        >
          <span className="flex min-w-0 flex-col gap-[6px]">
            <span className="truncate text-[16px] leading-[normal] font-semibold text-[#1c1c1c]">
              {selectedPlace.title}
            </span>
            <span className="truncate text-[14px] leading-[normal] font-normal text-[#7f7f7f]">
              {selectedPlace.address}
            </span>
          </span>
          <button
            type="button"
            onClick={onClear}
            className="text-main-5 shrink-0 text-[16px] font-semibold"
          >
            변경
          </button>
        </div>
      ) : (
        <div className="relative">
          <span
            className={`${INPUT_CLASS_NAME} relative flex items-center justify-between gap-[16px]`}
          >
            <input
              type="text"
              value={query}
              placeholder="사업장 주소"
              aria-label="사업장 검색"
              onChange={(event) => onQueryChange(event.target.value)}
              className="min-w-0 flex-1 bg-transparent leading-[normal] text-[#1c1c1c] outline-none placeholder:text-[#7f7f7f]"
            />
            <img
              src={search}
              alt=""
              aria-hidden="true"
              className="size-[18px] shrink-0"
            />
          </span>

          {isDropdownOpen && (
            <ul className="absolute inset-x-0 top-full z-10 mt-[8px] max-h-[280px] overflow-y-auto rounded-[12px] border border-[#e4e4e4] bg-white shadow-lg">
              {isLoading && results.length === 0 && (
                <li className="px-[20px] py-[16px] text-[16px] text-[#7f7f7f]">
                  검색 중이에요
                </li>
              )}
              {!isLoading && results.length === 0 && (
                <li className="px-[20px] py-[16px] text-[16px] text-[#7f7f7f]">
                  검색 결과가 없어요
                </li>
              )}
              {results.map((place) => (
                <li key={place.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(place)}
                    className="flex w-full flex-col gap-[6px] px-[20px] py-[14px] text-left hover:bg-[#f1f1f1]"
                  >
                    <span className="truncate text-[16px] leading-[normal] font-semibold text-[#1c1c1c]">
                      {place.title}
                    </span>
                    <span className="truncate text-[14px] leading-[normal] text-[#7f7f7f]">
                      {place.address}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function TextField({
  label,
  value,
  placeholder,
  hint,
  inputMode,
  maxLength,
  onChange,
}: {
  readonly label: string;
  readonly value: string;
  readonly placeholder: string;
  readonly hint?: string;
  readonly inputMode?: 'numeric';
  readonly maxLength?: number;
  readonly onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-[20px]">
      <SectionLabel>{label}</SectionLabel>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        className={`${INPUT_CLASS_NAME} w-full leading-[normal] text-[#1c1c1c] outline-none placeholder:text-[#7f7f7f] focus:border-[#ff6f41]`}
      />
      {hint && (
        <span className="-mt-[8px] text-[14px] leading-[normal] text-[#e5484d]">
          {hint}
        </span>
      )}
    </label>
  );
}

/** 사업자 인증 폼 — 시안 순서대로 업로드, 주소, 대표자, 등록번호, 개업일자. */
export function BusinessVerificationDesktopForm({
  query,
  searchResults,
  isSearching,
  place,
  representativeName,
  registrationNumber,
  registrationNumberHint,
  openedAt,
  onCertificateChange,
  onQueryChange,
  onPlaceSelect,
  onPlaceClear,
  onRepresentativeNameChange,
  onRegistrationNumberChange,
  onOpenedAtChange,
}: BusinessVerificationDesktopFormProps) {
  return (
    <section className="flex flex-col gap-[40px]">
      <CertificateUpload onChange={onCertificateChange} />
      <PlaceSearch
        query={query}
        results={searchResults}
        isLoading={isSearching}
        selectedPlace={place}
        onQueryChange={onQueryChange}
        onSelect={onPlaceSelect}
        onClear={onPlaceClear}
      />
      {/* 상호명은 선택한 장소에서 자동으로 채워 보내서 시안처럼 화면에 두지 않는다. */}
      <TextField
        label="대표자 명"
        value={representativeName}
        placeholder="대표자 명"
        onChange={onRepresentativeNameChange}
      />
      <TextField
        label="사업자등록번호"
        value={registrationNumber}
        placeholder="예) 123-45-67890"
        hint={registrationNumberHint}
        inputMode="numeric"
        // 하이픈 2개까지 포함한 완성 형태의 길이
        maxLength={12}
        onChange={onRegistrationNumberChange}
      />
      <div className="flex flex-col gap-[20px]">
        <SectionLabel>개업일자</SectionLabel>
        <DatePicker
          value={openedAt}
          placeholder="날짜"
          scale={DATE_PICKER_SCALE}
          ariaLabel="개업일자 선택"
          onChange={onOpenedAtChange}
        />
      </div>
    </section>
  );
}
