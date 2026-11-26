import { FaGithub } from 'react-icons/fa6';
import { Link } from 'react-router-dom';

import logo from '../../../assets/icons/logo.svg';
import {
  FOOTER_CONTACT_EMAIL,
  FOOTER_GITHUB_URL,
  FOOTER_TERMS_LABEL,
  FOOTER_TERMS_URL,
} from '../../../constants/footer';

// Figma 1440 데스크톱 시안(footer, 1440×325) 기준 리터럴 px
const FOOTER_MAX_WIDTH = 1440;
const FOOTER_PADDING_X = 80;

/**
 * 데스크톱 화면 공통 푸터 — 로고, Contact(GitHub·이메일), 구분선 아래
 * 이용약관. 내용은 가운데 정렬이고 구분선·약관은 좌우 80px 안쪽에 둔다.
 */
function DesktopFooter() {
  return (
    <footer className="w-full bg-[#F1F1F1]">
      <div
        className="mx-auto flex w-full flex-col pt-[40px] pb-[40px]"
        style={{
          maxWidth: FOOTER_MAX_WIDTH,
          paddingLeft: FOOTER_PADDING_X,
          paddingRight: FOOTER_PADDING_X,
        }}
      >
        <div className="flex flex-col items-center">
          <img src={logo} alt="여기도" className="size-[40px]" />
          <p className="text-gray-4 mt-[24px] text-[18px] leading-[21px] font-semibold">
            Contact
          </p>
          <a
            href={FOOTER_GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="여기도 GitHub (새 탭)"
            className="text-gray-4 mt-[16px] block"
          >
            <FaGithub aria-hidden="true" className="size-[32px]" />
          </a>
          <a
            href={`mailto:${FOOTER_CONTACT_EMAIL}`}
            className="text-gray-4 mt-[16px] text-[18px] leading-[21px] font-medium"
          >
            {FOOTER_CONTACT_EMAIL}
          </a>
        </div>

        <hr className="border-gray-2 mt-[32px] border-t" />

        <div className="mt-[23px] text-[16px] leading-[19px] font-medium">
          <Link to={FOOTER_TERMS_URL} className="text-gray-4">
            {FOOTER_TERMS_LABEL}
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default DesktopFooter;
