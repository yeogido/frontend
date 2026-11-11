interface RequestItem {
  requestId: number;
}

interface RequestPage<TItem extends RequestItem> {
  items: TItem[];
}

// 훅 파일은 react-query를 import해서 Node 테스트 러너가 읽지 못한다.
// 페이지 병합과 행 제거만 따로 두어 그대로 검증한다.

// 페이지를 하나의 목록으로 합친다. 한 요청이 처리되는 사이 커서가 밀려 같은
// requestId가 두 페이지에 걸리면 앞에 나온 것만 남긴다.
export function getRequestsFromPages<TItem extends RequestItem>(
  pages: readonly RequestPage<TItem>[] | undefined
): TItem[] {
  const seen = new Set<number>();
  const requests: TItem[] = [];

  for (const page of pages ?? []) {
    for (const item of page.items) {
      if (!seen.has(item.requestId)) {
        seen.add(item.requestId);
        requests.push(item);
      }
    }
  }

  return requests;
}

// 처리에 성공한 요청을 캐시된 모든 페이지에서 뺀다. 데이터가 없으면 그대로 둔다.
export function removeRequestFromData<
  TItem extends RequestItem,
  TPage extends RequestPage<TItem>,
  TData extends { pages: TPage[] },
>(data: TData | undefined, requestId: number): TData | undefined {
  if (!data) {
    return data;
  }

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: page.items.filter((item) => item.requestId !== requestId),
    })),
  };
}
