import { FaGithub } from 'react-icons/fa6';

import logo from '../../assets/icons/logo.svg';
import {
  FOOTER_CONTACT_EMAIL,
  FOOTER_GITHUB_URL,
  FOOTER_TERMS_LABEL,
  FOOTER_TERMS_URL,
} from '../../constants/footer';
import { useGlobalScale } from '../../hooks/useGlobalScale';

// 모든 수치는 Figma 390 모바일 시안(footer, 390×190) 기준 px
const PADDING_TOP = 20;
const PADDING_BOTTOM = 20;
const PADDING_X = 24;
const LOGO_SIZE = 24;
const CONTACT_MARGIN_TOP = 12;
const GITHUB_MARGIN_TOP = 8;
const GITHUB_SIZE = 24;
const EMAIL_MARGIN_TOP = 8;
const DIVIDER_MARGIN_TOP = 16;
const TERMS_MARGIN_TOP = 15;
const TEXT_SIZE = 12;
const TEXT_LINE_HEIGHT = 14;

/**
 * 모바일 화면 공통 푸터 — 로고, Contact(GitHub·이메일), 구분선 아래
 * 이용약관. 데스크톱 푸터(DesktopFooter)와 같은 내용을 모바일 크기로 그린다.
 */
function Footer() {
  const scale = useGlobalScale();
  const textStyle = {
    fontSize: TEXT_SIZE * scale,
    lineHeight: `${TEXT_LINE_HEIGHT * scale}px`,
  };

  return (
    <footer
      className="flex w-full flex-col bg-[#F1F1F1]"
      style={{
        paddingTop: PADDING_TOP * scale,
        paddingBottom: PADDING_BOTTOM * scale,
        paddingLeft: PADDING_X * scale,
        paddingRight: PADDING_X * scale,
      }}
    >
      <div className="flex flex-col items-center">
        <img
          src={logo}
          alt="여기도"
          style={{ width: LOGO_SIZE * scale, height: LOGO_SIZE * scale }}
        />
        <p
          className="text-gray-4 font-semibold"
          style={{ ...textStyle, marginTop: CONTACT_MARGIN_TOP * scale }}
        >
          Contact
        </p>
        <a
          href={FOOTER_GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="여기도 GitHub (새 탭)"
          className="text-gray-4 block"
          style={{ marginTop: GITHUB_MARGIN_TOP * scale }}
        >
          <FaGithub
            aria-hidden="true"
            style={{ width: GITHUB_SIZE * scale, height: GITHUB_SIZE * scale }}
          />
        </a>
        <a
          href={`mailto:${FOOTER_CONTACT_EMAIL}`}
          className="text-gray-4 font-medium"
          style={{ ...textStyle, marginTop: EMAIL_MARGIN_TOP * scale }}
        >
          {FOOTER_CONTACT_EMAIL}
        </a>
      </div>

      <hr
        className="border-gray-2 border-t"
        style={{ marginTop: DIVIDER_MARGIN_TOP * scale }}
      />

      <div
        className="font-medium"
        style={{ ...textStyle, marginTop: TERMS_MARGIN_TOP * scale }}
      >
        {FOOTER_TERMS_URL ? (
          <a
            href={FOOTER_TERMS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-4"
          >
            {FOOTER_TERMS_LABEL}
          </a>
        ) : (
          <span className="text-gray-4">{FOOTER_TERMS_LABEL}</span>
        )}
      </div>
    </footer>
  );
}

export default Footer;
