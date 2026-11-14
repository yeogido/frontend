import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getTravelFolderShareData,
  getTravelShareIntentUrl,
  getKakaoTravelShareTemplate,
} from '../src/pages/travel-record/utils/externalShare.ts';
import type { TravelRecordFolder } from '../src/pages/travel-record/types';

const folder = {
  id: '20',
  title: '부산 & 바다 #여행',
  visibility: 'public',
  permissions: { canLinkShare: true },
} as TravelRecordFolder;

test('only server-authorized PUBLIC folders yield a canonical share target', () => {
  assert.deepEqual(getTravelFolderShareData(folder, 'https://yeogido.kr'), {
    title: '부산 & 바다 #여행 | 여기도',
    text: '여기도에서 여행 폴더를 확인해 보세요.',
    url: 'https://yeogido.kr/travel-record/20',
  });
  for (const visibility of ['private', 'friends'] as const)
    assert.equal(
      getTravelFolderShareData({ ...folder, visibility }, 'https://yeogido.kr'),
      null
    );
  assert.equal(
    getTravelFolderShareData(
      { ...folder, permissions: undefined },
      'https://yeogido.kr'
    ),
    null
  );
  assert.equal(
    getTravelFolderShareData(
      { ...folder, id: 'preview-20' },
      'https://yeogido.kr'
    ),
    null
  );
});

test('direct app URLs preserve Korean text and URL delimiters as parameters', () => {
  const data = {
    title: '부산 & 바다 #여행',
    text: '여기도',
    url: 'https://yeogido.kr/travel-record/20',
  };
  const x = new URL(getTravelShareIntentUrl('x', data));
  assert.equal(x.origin + x.pathname, 'https://x.com/intent/tweet');
  assert.equal(
    x.searchParams.get('url'),
    'https://yeogido.kr/travel-record/20'
  );
  assert.equal(x.searchParams.get('text'), '부산 & 바다 #여행');
  const threads = new URL(getTravelShareIntentUrl('threads', data));
  assert.equal(
    threads.origin + threads.pathname,
    'https://www.threads.com/intent/post'
  );
  assert.equal(threads.searchParams.get('url'), data.url);
  const tumblr = new URL(getTravelShareIntentUrl('tumblr', data));
  assert.equal(
    tumblr.origin + tumblr.pathname,
    'https://www.tumblr.com/widgets/share/tool'
  );
  assert.equal(tumblr.searchParams.get('posttype'), 'link');
  assert.equal(tumblr.searchParams.get('canonicalUrl'), data.url);
  assert.equal(tumblr.searchParams.get('content'), data.url);
  assert.equal(tumblr.searchParams.get('title'), data.title);
});

test('Kakao text templates attach the same folder for mobile and desktop without a registered template ID', () => {
  const result = getKakaoTravelShareTemplate({
    title: '부산 여행',
    text: '함께 봐요',
    url: 'https://yeogido.kr/travel-record/20',
  });
  assert.deepEqual(result, {
    objectType: 'text',
    text: '부산 여행\n함께 봐요',
    link: {
      mobileWebUrl: 'https://yeogido.kr/travel-record/20',
      webUrl: 'https://yeogido.kr/travel-record/20',
    },
    buttonTitle: '폴더 보기',
  });
});

test('Kakao template text stays within 200 characters without splitting emoji', () => {
  const result = getKakaoTravelShareTemplate({
    title: '🌊'.repeat(230),
    text: '',
    url: 'https://yeogido.kr/travel-record/20',
  });
  assert.equal(Array.from(result.text).length, 200);
  assert.ok(result.text.endsWith('…'));
  assert.equal(result.text.includes('\uFFFD'), false);
});
