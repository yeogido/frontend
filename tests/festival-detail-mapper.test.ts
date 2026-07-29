import assert from 'node:assert/strict';
import test from 'node:test';

import {
  mapFestivalDetailDtoToViewModel,
  toSafeExternalUrl,
  toTelHref,
} from '../src/pages/detail/mappers/festivalDetailMapper.ts';

const validDto = {
  id: 7,
  title: '테스트축제',
  heroImageUrl: 'https://example.com/hero.webp',
  liked: false,
  tags: [{ id: 1, tagId: 'summer' as const }],
  overview: '소개 문구',
  address: '경기도 어딘가 1',
  period: '2026.07.04 ~ 2026.07.05',
  phone: '0507-0000-0000',
  homepageUrl: 'https://example.com',
  place: {
    id: 1,
    name: '테스트장소',
    address: '경기도 어딘가 1',
    hours: '평일 10:00 - 24:00',
    image: 'https://example.com/place.webp',
    liked: false,
    latitude: 37.4562,
    longitude: 127.687,
  },
  relatedCourses: [],
};

test('좌표가 있으면 place.location 으로 변환한다', () => {
  const festival = mapFestivalDetailDtoToViewModel(validDto);

  assert.deepEqual(festival.place.location, {
    latitude: 37.4562,
    longitude: 127.687,
  });
});

/** 지정한 키를 뺀 얕은 복사본. 테스트에서 필수 필드 누락을 만들 때 쓴다. */
function omit<T extends object>(source: T, key: keyof T): Partial<T> {
  const copy: Partial<T> = { ...source };
  delete copy[key];
  return copy;
}

test('좌표가 없으면 place.location 은 undefined 다', () => {
  const festival = mapFestivalDetailDtoToViewModel({
    ...validDto,
    place: omit(omit(validDto.place, 'latitude'), 'longitude'),
  });

  assert.equal(festival.place.location, undefined);
});

test('필수 필드가 빠지면 매핑이 실패한다', () => {
  assert.throws(() =>
    mapFestivalDetailDtoToViewModel(omit(validDto, 'period'))
  );
});

test('id 가 없으면 fallbackId 를 쓴다', () => {
  const festival = mapFestivalDetailDtoToViewModel(omit(validDto, 'id'), '42');

  assert.equal(festival.id, '42');
});

test('홈페이지 라벨 기본값은 공식홈페이지다', () => {
  const festival = mapFestivalDetailDtoToViewModel(validDto);

  assert.equal(festival.homepageLabel, '공식홈페이지');
});

test('http/https 가 아닌 홈페이지 URL 은 버린다', () => {
  assert.equal(toSafeExternalUrl('https://example.com'), 'https://example.com');
  assert.equal(toSafeExternalUrl('javascript:alert(1)'), undefined);
  assert.equal(toSafeExternalUrl('example.com'), undefined);
  assert.equal(toSafeExternalUrl(''), undefined);

  const festival = mapFestivalDetailDtoToViewModel({
    ...validDto,
    homepageUrl: 'javascript:alert(1)',
  });
  assert.equal(festival.homepageUrl, '');
});

test('전화번호는 숫자만 남겨 tel: 링크로 만든다', () => {
  assert.equal(toTelHref('0507-1470-1661'), 'tel:050714701661');
  assert.equal(toTelHref('02 123 4567'), 'tel:021234567');
  assert.equal(toTelHref('1234'), undefined);
  assert.equal(toTelHref(''), undefined);
});
