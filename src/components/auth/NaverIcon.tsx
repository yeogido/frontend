import type { SVGProps } from 'react';

function NaverIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath="url(#naver-icon-clip)">
        <path
          d="M13.5614 10.7033L6.14609 0H0V20H6.43861V9.295L13.8539 20H20V0H13.5614V10.7033Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="naver-icon-clip">
          <rect
            width="20"
            height="20"
            fill="white"
          />
        </clipPath>
      </defs>
    </svg>
  );
}

export default NaverIcon;
