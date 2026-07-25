import assert from 'node:assert/strict';
import test, { beforeEach } from 'node:test';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';

(globalThis as any).React = React;

import PlacePhotoModal from '../src/pages/local-recommendation/place-selection/components/PlacePhotoModal.tsx';
import PlacePhotoUploader from '../src/pages/local-recommendation/place-selection/components/PlacePhotoUploader.tsx';
import PlacePhotoModalFooter from '../src/pages/local-recommendation/place-selection/components/PlacePhotoModalFooter.tsx';
import { usePlacePhotoModal } from '../src/pages/local-recommendation/place-selection/hooks/usePlacePhotoModal.ts';
import { useSelectedPlaces } from '../src/pages/local-recommendation/place-selection/hooks/useSelectedPlaces.ts';
import type { PlaceItem } from '../src/pages/local-recommendation/place-selection/types.ts';

class MockElement {
  nodeType = 1;
  nodeName = 'DIV';
  children: MockElement[] = [];
  childNodes: MockElement[] = [];
  parentNode: MockElement | null = null;
  style: any = {};
  ownerDocument: any = null;
  listeners: Record<string, Function[]> = {};

  constructor(tagName = 'div') {
    this.nodeName = tagName.toUpperCase();
  }

  get tagName() {
    return this.nodeName;
  }

  set tagName(v: string) {
    this.nodeName = v ? v.toUpperCase() : 'DIV';
  }

  appendChild(child: MockElement) {
    if (child.parentNode) child.parentNode.removeChild(child);
    child.parentNode = this;
    this.children.push(child);
    this.childNodes.push(child);
    return child;
  }

  insertBefore(child: MockElement, before: MockElement | null) {
    if (!before) return this.appendChild(child);
    const idx = this.children.indexOf(before);
    if (idx !== -1) {
      this.children.splice(idx, 0, child);
      this.childNodes.splice(idx, 0, child);
      child.parentNode = this;
    } else {
      this.appendChild(child);
    }
    return child;
  }

  removeChild(child: MockElement) {
    const idx = this.children.indexOf(child);
    if (idx !== -1) {
      this.children.splice(idx, 1);
      this.childNodes.splice(idx, 1);
      child.parentNode = null;
    }
    return child;
  }

  setAttribute(k: string, v: string) {
    (this as any)[k] = v;
  }

  getAttribute(k: string) {
    return (this as any)[k];
  }

  removeAttribute(k: string) {
    delete (this as any)[k];
  }

  addEventListener(type: string, fn: Function) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(fn);
  }

  removeEventListener(type: string, fn: Function) {
    if (this.listeners[type]) {
      this.listeners[type] = this.listeners[type].filter((f) => f !== fn);
    }
  }
}

class MockDocument {
  nodeType = 9;
  nodeName = '#DOCUMENT';
  get tagName() {
    return this.nodeName;
  }
  body = new MockElement('body');
  activeElement = null;
  listeners: Record<string, Function[]> = {};

  constructor() {
    this.body.ownerDocument = this;
  }

  createElement(tag: string) {
    const el = new MockElement(tag);
    el.ownerDocument = this;
    return el;
  }

  createElementNS(_ns: string, tag: string) {
    return this.createElement(tag);
  }

  createTextNode(text: string) {
    const el = (new MockElement('#text') as any);
    el.nodeType = 3;
    el.nodeValue = text;
    el.ownerDocument = this;
    return el;
  }

  createComment(text: string) {
    const el = (new MockElement('#comment') as any);
    el.nodeType = 8;
    el.nodeValue = text;
    el.ownerDocument = this;
    return el;
  }

  addEventListener(type: string, fn: Function) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(fn);
  }

  removeEventListener(type: string, fn: Function) {
    if (this.listeners[type]) {
      this.listeners[type] = this.listeners[type].filter((f) => f !== fn);
    }
  }
}

const mockDoc = new MockDocument();
(globalThis as any).document = mockDoc;
(globalThis as any).window = globalThis;
(globalThis as any).Element = MockElement;
(globalThis as any).HTMLElement = MockElement;
(globalThis as any).HTMLInputElement = MockElement;
(globalThis as any).HTMLIFrameElement = class MockIFrame {};
(globalThis as any).HTMLDocument = MockDocument;
(globalThis as any).Document = MockDocument;
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let createdBlobUrls: string[] = [];
let revokedBlobUrls: string[] = [];

beforeEach(() => {
  createdBlobUrls = [];
  revokedBlobUrls = [];
  (globalThis as any).URL = {
    createObjectURL: () => {
      const url = `blob:mock-url-${createdBlobUrls.length + 1}`;
      createdBlobUrls.push(url);
      return url;
    },
    revokeObjectURL: (url: string) => {
      revokedBlobUrls.push(url);
    },
  };
});

function renderHook<T>(useHook: () => T) {
  let result!: T;
  const container = mockDoc.createElement('div');
  const root = createRoot(container as any);

  function Component() {
    result = useHook();
    return null;
  }

  act(() => {
    root.render(React.createElement(Component));
  });

  return {
    get current() {
      return result;
    },
    rerender() {
      act(() => {
        root.render(React.createElement(Component));
      });
    },
    act(fn: () => void) {
      act(fn);
    },
    unmount() {
      act(() => {
        root.unmount();
      });
    },
  };
}

const samplePlace: PlaceItem = {
  id: 'place-101',
  title: '해운대 해수욕장',
  address: '부산광역시 해운대구 우동',
};

test('place add opens the photo modal without mutating selected places', () => {
  const selectedHook = renderHook(() => useSelectedPlaces());
  const modalHook = renderHook(() => usePlacePhotoModal());

  assert.deepEqual(selectedHook.current.selectedPlaces, []);
  assert.equal(modalHook.current.isImageModalOpen, false);
  assert.equal(modalHook.current.pendingPlace, null);

  modalHook.act(() => {
    modalHook.current.handlePlaceAdd(samplePlace);
  });

  assert.equal(modalHook.current.isImageModalOpen, true);
  assert.deepEqual(modalHook.current.pendingPlace, samplePlace);
  assert.deepEqual(selectedHook.current.selectedPlaces, []);

  // Assert modal container renders title text / header
  const modalHtml = renderToStaticMarkup(
    React.createElement(PlacePhotoModal, {
      placeTitle: modalHook.current.pendingPlace!.title,
      previewUrl: modalHook.current.pendingImagePreviewUrl,
      onFileChange: modalHook.current.handleImageFileChange,
      onClose: modalHook.current.closeImageModal,
      onConfirm: () => {},
    })
  );
  assert.ok(modalHtml.includes('사진을 추가해 주세요'));

  selectedHook.unmount();
  modalHook.unmount();
});

test('photo modal provides a preview upload flow and disables confirmation without one', () => {
  const modalHook = renderHook(() => usePlacePhotoModal());
  const mockFile = new File(['dummy'], 'haeundae.jpg', { type: 'image/jpeg' });

  // Render modal footer & uploader without previewUrl
  const footerWithoutPreview = renderToStaticMarkup(
    React.createElement(PlacePhotoModalFooter, {
      previewUrl: null,
      onConfirm: () => {},
    })
  );
  assert.ok(footerWithoutPreview.includes('disabled=""') || footerWithoutPreview.includes('disabled'));

  const uploaderWithoutPreview = renderToStaticMarkup(
    React.createElement(PlacePhotoUploader, {
      placeTitle: '해운대 해수욕장',
      previewUrl: null,
      onFileChange: () => {},
    })
  );
  assert.ok(uploaderWithoutPreview.includes('사진을 추가해 주세요.'));

  assert.equal(modalHook.current.pendingImagePreviewUrl, null);

  modalHook.act(() => {
    modalHook.current.handleImageFileChange(mockFile);
  });

  assert.equal(modalHook.current.pendingImageFile, mockFile);
  const previewUrl = modalHook.current.pendingImagePreviewUrl!;
  assert.ok(previewUrl.startsWith('blob:mock-url-'));

  // Render modal footer & uploader with previewUrl
  const footerWithPreview = renderToStaticMarkup(
    React.createElement(PlacePhotoModalFooter, {
      previewUrl,
      onConfirm: () => {},
    })
  );
  assert.ok(!footerWithPreview.includes('disabled=""'));

  const uploaderWithPreview = renderToStaticMarkup(
    React.createElement(PlacePhotoUploader, {
      placeTitle: '해운대 해수욕장',
      previewUrl,
      onFileChange: () => {},
    })
  );
  assert.ok(uploaderWithPreview.includes(`src="${previewUrl}"`));
  assert.ok(uploaderWithPreview.includes('해운대 해수욕장 사진 미리보기'));

  modalHook.unmount();
});

test('selected places keep their confirmed image file and preview URL', () => {
  const selectedHook = renderHook(() => useSelectedPlaces());
  const modalHook = renderHook(() => usePlacePhotoModal());
  const mockFile = new File(['dummy'], 'haeundae.jpg', { type: 'image/jpeg' });

  modalHook.act(() => {
    modalHook.current.handlePlaceAdd(samplePlace);
    modalHook.current.handleImageFileChange(mockFile);
  });

  const previewUrl = modalHook.current.pendingImagePreviewUrl!;

  selectedHook.act(() => {
    selectedHook.current.addSelectedPlace(
      modalHook.current.pendingPlace!,
      modalHook.current.pendingImageFile!,
      previewUrl
    );
    modalHook.current.clearModalState();
  });

  assert.equal(modalHook.current.isImageModalOpen, false);
  assert.equal(modalHook.current.pendingPlace, null);
  assert.equal(selectedHook.current.selectedPlaces.length, 1);
  assert.equal(selectedHook.current.selectedPlaces[0].id, 'place-101');
  assert.equal(selectedHook.current.selectedPlaces[0].imageFile, mockFile);
  assert.equal(selectedHook.current.selectedPlaces[0].imagePreviewUrl, previewUrl);

  selectedHook.unmount();
  modalHook.unmount();
});

test('selected places revoke the latest preview URLs on unmount cleanup', () => {
  const selectedHook = renderHook(() => useSelectedPlaces());
  const mockFile = new File(['dummy'], 'haeundae.jpg', { type: 'image/jpeg' });

  selectedHook.act(() => {
    selectedHook.current.addSelectedPlace(samplePlace, mockFile, 'blob:mock-url-999');
  });

  selectedHook.rerender();
  assert.equal(selectedHook.current.selectedPlaces.length, 1);

  selectedHook.unmount();
  assert.ok(revokedBlobUrls.includes('blob:mock-url-999'));
});
