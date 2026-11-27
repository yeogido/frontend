import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import {
  getKakaoTravelImageTemplate,
  normalizeKakaoImageUrl,
} from '../src/pages/travel-record/utils/externalShare.ts';

test('실제 카카오 HTTP 업로드 응답을 HTTPS로 변환하고 경로를 보존한다', () => {
  const path =
    '/dn/Qw1Nw/dJMb999J97I/21buvK1xg0FyxxLkJO1Ou0/kakaolink40_original.png';
  assert.equal(
    normalizeKakaoImageUrl(`http://k.kakaocdn.net${path}`),
    `https://k.kakaocdn.net${path}`
  );
  assert.equal(
    normalizeKakaoImageUrl(`https://k.kakaocdn.net${path}`),
    `https://k.kakaocdn.net${path}`
  );
  assert.throws(() => normalizeKakaoImageUrl('javascript:alert(1)'));
  assert.throws(() =>
    normalizeKakaoImageUrl('http://k.kakaocdn.net.example.test/card.png')
  );
});

test('이미지 메시지와 폴더 보기 버튼은 같은 토큰 링크를 유지한다', () => {
  const url = `https://yeogido.kr/travel-record/shared/${'a'.repeat(64)}`;
  const image = {
    url: 'https://example.test/card.png',
    width: 762,
    height: 960,
  };
  const template = getKakaoTravelImageTemplate(
    { title: '대구 | 여기도', text: '폴더를 확인해 보세요.', url },
    image
  );
  assert.equal(template.objectType, 'feed');
  assert.equal(template.content.imageUrl, image.url);
  assert.equal(template.content.imageWidth, 762);
  assert.equal(template.content.imageHeight, 960);
  assert.deepEqual(template.content.link, { mobileWebUrl: url, webUrl: url });
  assert.deepEqual(template.buttons, [
    { title: '폴더 보기', link: template.content.link },
  ]);
});

test('서로 다른 폴더에 생성한 이미지와 링크를 혼용하지 않는다', () => {
  const first = getKakaoTravelImageTemplate(
    {
      title: '서울',
      text: '',
      url: 'https://yeogido.kr/travel-record/shared/first',
    },
    { url: 'https://example.test/seoul.png', width: 762, height: 960 }
  );
  const second = getKakaoTravelImageTemplate(
    {
      title: '대구',
      text: '',
      url: 'https://yeogido.kr/travel-record/shared/second',
    },
    { url: 'https://example.test/daegu.png', width: 762, height: 960 }
  );
  assert.notEqual(first.content.imageUrl, second.content.imageUrl);
  assert.notEqual(first.buttons[0].link.webUrl, second.buttons[0].link.webUrl);
  assert.equal(second.content.title, '대구');
});
