import { useEffect, useRef, useState } from 'react';

import type { CourseTag } from '../types/course';

import { ShareIcon, tagIcons } from './icons';

interface TitleSectionProps {
  title: string;
  tags: CourseTag[];
}

const tagToneClassNames = {
  primary: 'border-main-5 text-main-5',
  green: 'border-green-3 text-green-3',
  blue: 'border-blue-3 text-blue-3',
  sky: 'border-sky-3 text-blue-3',
  neutral: 'border-gray-4 text-gray-5',
};

function TitleSection({ title, tags }: TitleSectionProps) {
  const [copied, setCopied] = useState(false);
  const [isToastVisible, setIsToastVisible] = useState(false);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setIsToastVisible(false);

      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

      animationFrameRef.current = requestAnimationFrame(() => {
        setIsToastVisible(true);
      });
      fadeTimerRef.current = setTimeout(() => setIsToastVisible(false), 1600);
      copiedTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setIsToastVisible(false);
      setCopied(false);
    }
  };

  return (
    <section className="bg-white px-5 pt-5 pb-0">
      <div className="flex items-start justify-between gap-3">
        <h1 className="min-w-0 text-[18px] leading-7 font-bold break-keep text-black">
          {title}
        </h1>

        <div className="shrink-0">
          <button
            type="button"
            aria-label="코스 공유하기"
            onClick={handleShare}
            className="flex h-8 w-8 items-center justify-center bg-white text-black"
          >
            <ShareIcon className="h-5 w-5" />
          </button>
          {copied && (
            <div className="pointer-events-none fixed inset-x-0 bottom-[84px] z-[60] mx-auto flex w-full max-w-[430px] justify-center px-5">
              <span
                role="status"
                className={`rounded-full bg-gray-5 px-4 py-2 text-center text-[13px] font-medium whitespace-nowrap text-white shadow-lg transition-all duration-400 ease-out ${
                  isToastVisible
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-3 opacity-0'
                }`}
              >
                복사 됨
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {tags.map(({ id, label, icon, tone }) => {
          const Icon = tagIcons[icon];

          return (
            <span
              key={id}
              className={`inline-flex h-6 max-w-full items-center gap-1 rounded-full border bg-white px-2.5 text-[12px] leading-none font-medium whitespace-nowrap ${tagToneClassNames[tone]}`}
            >
              <Icon className="h-3 w-3 shrink-0" />
              {label}
            </span>
          );
        })}
      </div>
    </section>
  );
}

export default TitleSection;
