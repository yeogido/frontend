interface DropdownPanelPositionInput {
  triggerTop: number;
  triggerBottom: number;
  viewportHeight: number;
  preferredHeight: number;
  gap: number;
  viewportInset: number;
}

interface DropdownPanelPosition {
  top: number;
  height: number;
}

export function getDropdownPanelPosition({
  triggerTop,
  triggerBottom,
  viewportHeight,
  preferredHeight,
  gap,
  viewportInset,
}: DropdownPanelPositionInput): DropdownPanelPosition {
  const availableAbove = Math.max(triggerTop - gap - viewportInset, 0);
  const availableBelow = Math.max(
    viewportHeight - triggerBottom - gap - viewportInset,
    0
  );
  const opensAbove =
    preferredHeight > availableBelow && availableAbove > availableBelow;
  const availableHeight = opensAbove ? availableAbove : availableBelow;
  const height = Math.min(preferredHeight, availableHeight);

  return {
    top: opensAbove ? triggerTop - gap - height : triggerBottom + gap,
    height,
  };
}
