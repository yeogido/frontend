import { useGlobalScale } from '../../hooks/useGlobalScale';
import desktopChevron from './assets/chevron-desktop.svg';
import mobileChevron from './assets/chevron-mobile.svg';
import { TERMS_CHAPTERS } from './termsData';

interface TermsContentProps {
  desktop?: boolean;
}

/** 제시된 약관 전문을 장별로 펼쳐 읽는다. */
function TermsContent({ desktop = false }: TermsContentProps) {
  const mobileScale = useGlobalScale();
  const scale = desktop ? 1 : mobileScale;

  return (
    <div>
      <h1
        className="font-semibold text-black"
        style={{
          fontSize: (desktop ? 32 : 18) * scale,
          lineHeight: `${(desktop ? 38 : 21) * scale}px`,
        }}
      >
        여기도 서비스 이용약관
      </h1>
      <p
        className="text-gray-5 font-normal"
        style={{
          marginTop: 6 * scale,
          fontSize: (desktop ? 20 : 14) * scale,
          lineHeight: `${(desktop ? 30 : 17) * scale}px`,
        }}
      >
        시행일: 2026년 11월 14일
      </p>

      <div
        className="flex flex-col"
        style={{
          marginTop: (desktop ? 60 : 12) * scale,
          gap: (desktop ? 24 : 12) * scale,
        }}
      >
        {TERMS_CHAPTERS.map((chapter) => (
          <details key={chapter.title} className="group border-gray-2 border-b">
            <summary
              className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-black [&::-webkit-details-marker]:hidden"
              style={{
                paddingTop: 24 * scale,
                paddingBottom: 24 * scale,
                fontSize: (desktop ? 24 : 20) * scale,
                lineHeight: `${(desktop ? 29 : 24) * scale}px`,
              }}
            >
              <span>{chapter.title}</span>
              <span
                className="shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none"
                style={{
                  width: (desktop ? 24 : 20) * scale,
                  height: (desktop ? 24 : 20) * scale,
                }}
              >
                <img
                  src={desktop ? desktopChevron : mobileChevron}
                  alt=""
                  aria-hidden="true"
                  style={
                    desktop
                      ? undefined
                      : {
                          transform: `scale(${scale})`,
                          transformOrigin: 'top left',
                        }
                  }
                />
              </span>
            </summary>
            <div
              className="font-normal break-words whitespace-pre-wrap text-black"
              style={{
                paddingTop: (desktop ? 24 : 12) * scale,
                paddingBottom: 24 * scale,
                fontSize: (desktop ? 20 : 16) * scale,
                lineHeight: desktop ? 1.5 : 1.25,
              }}
            >
              {chapter.content}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

export default TermsContent;
